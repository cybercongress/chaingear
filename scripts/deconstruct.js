var fs = require("fs");
var path = require('path');

var chaingear = require("../chaingear.json");
console.log("detected " +  chaingear.length + " entries in chaingear.json");

function saveSystem(system, index){
  if (!system.name) {
    throw new Error("system must have name")
  }
  var filename = path.join(__dirname,"..","sources.json",system.name + ".json");
  fs.writeFileSync(filename,  JSON.stringify(system, null, 4));
}

for (idx=0;idx<chaingear.length; idx++){
  saveSystem(chaingear[idx], idx+1);
}