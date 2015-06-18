var fs = require("fs");
var path = require('path');
var _ = require("underscore");

var chaingear = require("../chaingear.json");
console.log("detected " +  chaingear.length + " entries in chaingear.json");
function paddy(val, padlen, padchar) { //http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
  var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
  var pad = new Array(1 + padlen).join(pad_char);
  return (pad + val).slice(-pad.length);
}

var idx = 0;
_.each(chaingear, function(system){
  idx++;
  if (!system.name) {
    throw new Error("system must have name")
  }
  var filename = path.join(__dirname,"..","sources.json",(paddy(idx, 4)+"-" + system.name + ".json"));
  fs.writeFileSync(filename,  JSON.stringify(system, null, 4));
});