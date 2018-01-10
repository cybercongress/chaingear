var fs = require("fs");
var path = require('path');
var toml = require('toml');
var _ = require("lodash");

var errors = 0;

function loadToml(filename, result) {
  try {
    var fullname = path.join(filename);
    var data = fs.readFileSync(fullname);
    var parsed = toml.parse(data);

    result.push(parsed.system);
    if (!parsed.system) {
      errors += 1;
      console.error(fullname + ' has no system name. ' + parsed.system);
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
  var filenames_toml = walk( path.join(__dirname, "..", "sources") );

  for (var idx = 0; idx < filenames_toml.length; idx++) {
    loadToml(filenames_toml[idx], result);
  }

  var counts =_.countBy(result);
  _.each(counts, function(v,k){
    if (v!=1) {
      errors += 1;
      console.error(v + " system name duplicates for " + k);
    }
  });
}

act();
process.exit(errors);
/**
 * Created by angelo on 7/21/15.
 */
