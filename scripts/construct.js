var fs = require("fs");
var path = require('path');
var toml = require('toml');

//var filenames = fs.readdirSync(path.join(__dirname, "..", "sources.json"));


/*function loadSystem(filename) {
  try {
    var val = require(path.join(__dirname, "..", "sources.json", filename));
    result.push(val);
  } catch (e) {
    throw(e);
  }
}*/
var result = [];

function loadToml(filename) {
  try {
    var fullname = path.join(__dirname, "..", "sources.toml", filename);
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

function act() {
  var filenames_toml = fs.readdirSync(path.join(__dirname, "..", "sources.toml"));

  for (var idx = 0; idx < filenames_toml.length; idx++) {
    //loadSystem(filenames[idx])
    loadToml(filenames_toml[idx])
  }

  fs.writeFileSync(path.join(__dirname, "..", "chaingear.json"), JSON.stringify(result, null, 4));
  console.log("combined " + result.length + " entries into chaingear.json");
}

act();

