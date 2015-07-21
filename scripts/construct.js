var fs = require("fs");
var path = require('path');
var toml = require('toml');

function loadToml(filename, result) {
  try {
    var fullname = path.join(filename);
    var data = fs.readFileSync(fullname);
    var parsed = toml.parse(data);

    //this is a pathc. remove later.
    if (parsed && parsed.specs && !isNaN(parsed.specs.rating)){
      if (parsed.ratings) {
        parsed.ratings.rating_cyber = parsed.ratings.rating_cyber || parsed.specs.rating;
      } else {
        parsed.ratings = {rating_cyber: parsed.specs.rating};
      }
      delete parsed.specs.rating;
    }

    if (parsed.ratings && !isNaN(parsed.ratings.rating)) {
      parsed.ratings.rating_cyber = parsed.ratings.rating;
      delete parsed.ratings.rating;
    }


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
  console.log("combined " + result.length + " entries into chaingear.json");
}

act();
