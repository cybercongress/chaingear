var fs = require("fs");
var path = require('path');
var _ = require("underscore");

var filenames = fs.readdirSync(path.join(__dirname,"..","sources.json"));
var result = [];
_.each(filenames, function(filename){
  try {
    var val = require(path.join(__dirname, "..", "sources.json", filename));
    result.push(val);
  } catch(e) {
    throw(e);
  }

});

fs.writeFileSync(path.join(__dirname,"..","chaingear.json"), JSON.stringify(result, null, 4));
console.log("combined "+ result.length + " entries into chaingear.json");
