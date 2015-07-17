var fs = require("fs");
var path = require('path');
//var toml = require("toml-js")
var tomlify = require('tomlify-j0.4');
var chaingear = require("../chaingear.json");
console.log("detected " +  chaingear.length + " entries in chaingear.json");

function saveToml(system){
  if (!system.system) {
    throw new Error("system must have 'system' field, corresponding to its unique name in chaingear")
  }

  // create directory or throw exception if exists
  var mkdirSync = function (path) {
    try {
      fs.mkdirSync(path);
    } catch(e) {
      if ( e.code != 'EEXIST' ) throw e;
    }
  };
  var nom = system.system;
  mkdirSync( path.join(__dirname,"..","sources", nom));

  var filename = path.join(__dirname,"..","sources",nom,nom + ".toml"); //om nom nom
  fs.writeFileSync(filename,  tomlify(system, null, 2));

}

for (idx=0;idx<chaingear.length; idx++){
  saveToml(chaingear[idx]);
}