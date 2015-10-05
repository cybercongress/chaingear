var fs = require("fs");
var path = require('path');
var toml = require('toml');

function loadToml(filename, result) {
  try {
    var fullname = path.join(filename);
    var data = fs.readFileSync(fullname);
    var parsed = toml.parse(data);
    result.push(parsed);
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
  var filenames_toml = walk( path.join(__dirname, "..", "sources") );

  for (var idx = 0; idx < filenames_toml.length; idx++) {
    loadToml(filenames_toml[idx], result);
  }

  fs.writeFileSync(path.join(__dirname, "..", "chaingear.json"), JSON.stringify(result, null, 4));
  fs.writeFileSync(path.join(__dirname, "..", "v1.json"), JSON.stringify(result, null, 4));
  console.log("");
  console.log("Combined " + result.length + " entries into v1.json");
  console.log("");
  console.log("Without logo:");
  console.log("Wihtou headline: ");
  console.log("");
  console.log("Cryptocurrencies");
  console.log("No Genesis ID:");
  console.log("No Token name:");
  console.log("No Ticker:");
  console.log("No Code link:");
  console.log("No Explorer link:");
  console.log("No Wallet link:");
  console.log("No Paper link:");
  console.log("No Exchange link:");
  console.log("");
  console.log("Cryptoassets");
  console.log("No Genesis ID:");
  console.log("No Token name:");
  console.log("No Ticker:");
  console.log("");
  console.log("Projects count:");
  console.log("");
}

act();
