var fs = require("fs");
var path = require('path');
var toml = require('toml');
var _ = require('lodash');

function hasLinkOfType(links, type) {
  type = type || '';
  type = type.toLowerCase();
  return !!_.find(links, function(link){
    return link.type == type;
  });
}

function loadToml(filename, result, statistics) {
  try {
    var fullname = path.join(filename);
    var data = fs.readFileSync(fullname);
    var parsed = toml.parse(data);
    result.push(parsed);

    if (statistics) {

      var name = parsed.system || filename,
        tags = parsed.descriptions && parsed.descriptions.tags || [];
        isCurrency = tags.indexOf('DAO') > -1;
        isAsset =  tags.indexOf('DApp');
        isProject = parsed.descriptions && parsed.descriptions.state == 'Project';
      //if (!parsed.icon) statistics.no_logo.push(name);
      if (!parsed.descriptions || !parsed.descriptions.headline) statistics.no_headline.push(name);
      if (isProject) {
        statistics.projects.push(name);
      } else {
        if (isCurrency) {
          statistics.currencies.total++;
          if (!parsed.genesis_id) statistics.currencies.no_genesis.push(name);
          if (!parsed.token || !parsed.token.token_name) statistics.currencies.no_token.push(name);
          if (!parsed.token || !parsed.token.token_symbol) statistics.currencies.no_ticker.push(name);
          var links = parsed.links || [];
          if (!hasLinkOfType(links, 'code')) statistics.currencies.no_code_link.push(name);
          if (!hasLinkOfType(links, 'paper')) statistics.currencies.no_paper_link.push(name);
          if (!hasLinkOfType(links, 'wallet')) statistics.currencies.no_wallet_link.push(name);
          if (!hasLinkOfType(links, 'explorer')) statistics.currencies.no_explorer_link.push(name);
          if (!hasLinkOfType(links, 'exchange')) statistics.currencies.no_exchange_link.push(name);
        }
        if (isAsset) {
          statistics.assets.total++;
          if (!parsed.genesis_id) statistics.assets.no_genesis.push(name);
          if (!parsed.token || !parsed.token.token_name) statistics.assets.no_token.push(name);
          if (!parsed.token || !parsed.token.token_symbol) statistics.assets.no_ticker.push(name);
        }
      }
    }
  } catch (e) {
    console.error("Parsing error on line " + e.line + ", column " + e.column +
      ": " + e.message);
    console.error(";at file " + fullname);
    throw(e);
  }

}

var walk = function (dir) {
  var results = [];

  var list = fs.readdirSync(dir);

  list.forEach(function (_file) {
    var file = path.join(dir, _file);
    var stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.split(".").pop() != "toml") {
        console.log("found non-toml file^" + dir + "/" + file);
        return;
      }
      results.push(file)
    }
  });
  return results
};

function act() {
  var result = [];
  var filenames_toml = walk(path.join(__dirname, "..", "sources"));

  var statistics = {
    no_logo: [],
    no_headline: [],
    currencies: {
      total: 0,
      no_genesis: [],
      no_token: [],
      no_ticker: [],
      no_code_link: [],
      no_explorer_link: [],
      no_wallet_link: [],
      no_paper_link: [],
      no_exchange_link: []
    },
    assets: {
      total: 0,
      no_genesis: [],
      no_token: [],
      no_ticker: []
    },
    projects: []
  };

  for (var idx = 0; idx < filenames_toml.length; idx++) {
    loadToml(filenames_toml[idx], result, statistics);
  }

  fs.writeFileSync(path.join(__dirname, "..", "chaingear.json"), JSON.stringify(result, null, 4));
  fs.writeFileSync(path.join(__dirname, "..", "v1.json"), JSON.stringify(result, null, 4));
  fs.writeFileSync(path.join(__dirname, "..", "statistics.json"), JSON.stringify(statistics, null, 4));

  console.log("");
  console.log("Combined " + result.length + " entries into v1.json");
  _.each(statistics.currencies, function(item, key){
    if (_.isArray(statistics.currencies[key])) statistics.currencies[key] = statistics.currencies[key].length;
  })
  _.each(statistics.assets, function(item, key){
    if (_.isArray(statistics.assets[key])) statistics.assets[key] = statistics.assets[key].length;
  })
  _.each(statistics, function(item, key){
    if (_.isArray(statistics[key])) statistics[key] = statistics[key].length;
  })
  console.log(statistics);
}

act();
