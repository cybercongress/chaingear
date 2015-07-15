var fs = require("fs");
var path = require('path');
//var toml = require("toml-js")
var tomlify = require('tomlify-j0.4');
var chaingear = require("../chaingear.json");
console.log("detected " +  chaingear.length + " entries in chaingear.json");

/*function saveSystem(system){
  if (!system.name) {
    throw new Error("system must have name")
  }
  var filename = path.join(__dirname,"..","sources.json",system.name + ".json");
  fs.writeFileSync(filename,  JSON.stringify(system, null, 4));
}*/
/*
var names = ["BitBar",
  "GoldReserv",
  "MetalCoin",
  "Bytecoin",
  "Copperlark",
  "Vanillacoin",
  "Rubycoin",
  "Pandacoin",
  "Altcoin",
  "Sync",
  "VootCoin",
  "Guerillacoin",
  "CoffeeCoin",
  "CrackCoin",
  "Stellar" ];

var others = []
*/
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

  //first letter, capitalized, or '1' is string starts from digit
  var indexDirName = function(str){
    var first = str.slice(0,1).toUpperCase();
    if (! isNaN (parseInt (first) ) ) return '1';
    return first;
  };
  var nom = system.system;

  var directories = '1ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (var j=0; j<directories.length; j++){
    mkdirSync( path.join(__dirname,"..","sources.toml", directories[j]));
  }
  mkdirSync( path.join(__dirname,"..","sources.toml",indexDirName(nom), nom));

  var filename = path.join(__dirname,"..","sources.toml",indexDirName(nom),nom,nom + ".toml"); //om nom nom
  fs.writeFileSync(filename,  tomlify(system, null, 2));
 // fs.writeFileSync(path.join(__dirname,"..","others.json"),  JSON.stringify(others, null, 2));
}

for (idx=0;idx<chaingear.length; idx++){
  saveToml(chaingear[idx]);
}