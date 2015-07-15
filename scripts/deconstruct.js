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
  /*if (names.indexOf(system.name)>=0){
    others.push(system);
  }*/
 /* display duplicate names..
  if (names.indexOf(system.name)>=0) {

    console.log(system.name);
  } else {
    names.push(system.name)
  }*/
  var mkdirSync = function (path) {
    try {
      fs.mkdirSync(path);
    } catch(e) {
      if ( e.code != 'EEXIST' ) throw e;
    }
  };
  mkdirSync( path.join(__dirname,"..","sources.toml",system.system ));

  var filename = path.join(__dirname,"..","sources.toml",system.system,system.system + ".toml");
  fs.writeFileSync(filename,  tomlify(system, null, 2));
 // fs.writeFileSync(path.join(__dirname,"..","others.json"),  JSON.stringify(others, null, 2));
}

for (idx=0;idx<chaingear.length; idx++){
  saveToml(chaingear[idx]);
}