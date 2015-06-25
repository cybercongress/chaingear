var fs = require("fs");
var path = require('path');
//var toml = require("toml-js")
var tomlify = require('tomlify-j0.4');
var chaingear = require("../chaingear.json");
console.log("detected " +  chaingear.length + " entries in chaingear.json");

function saveSystem(system){
  if (!system.name) {
    throw new Error("system must have name")
  }
  var filename = path.join(__dirname,"..","sources.json",system.name + ".json");
  fs.writeFileSync(filename,  JSON.stringify(system, null, 4));
}

// var names = [];

function saveToml(system,id){
  if (!system.name) {
    throw new Error("system must have name")
  }
 /* display duplicate names..
  if (names.indexOf(system.name)>=0) {

    console.log(system.name);
  } else {
    names.push(system.name)
  }*/
  var filename = path.join(__dirname,"..","sources.toml",system.name + ".toml");
  fs.writeFileSync(filename,  tomlify(system, null, 2));
}

for (idx=0;idx<chaingear.length; idx++){
  saveSystem(chaingear[idx]);
  saveToml(chaingear[idx], idx+1);
}