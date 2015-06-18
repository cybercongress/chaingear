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
console.log(result.length);
fs.writeFileSync(path.join(__dirname,"..","chaingear.json"), JSON.stringify(result, null, 4));

/*
var idx = 0;
_.each(chaingear, function(system){
  idx++;
  if (!system.name) {
    throw new Error("system must have name")
  }
  var filename = idx+"-" + system.name + ".json";
  fs.writeFileSync(filename,  JSON.stringify(system, null, 4));
});
*/