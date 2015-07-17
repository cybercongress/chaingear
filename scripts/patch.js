var fs = require("fs");
var path = require('path');

var chaingear = require("../chaingear.json");

for (var i = 0; i < chaingear.length; i++) {
  var item = chaingear[i];
  if (item.ratings && item.ratings.rating) {
    item.ratings.rating_cyber = item.ratings.rating;
    delete item.ratings.rating;
  }
  if (item.specs) {
    if (item.specs.rating == 0) {
      delete item.specs.rating;
    }

    if (item.specs.ann) {
      var link = {
        "name": "Announcement",
        "url": item.specs.ann,
        "type": "custom",
        "tags": ["publications"]
      };
      if (item.links) {
        item.links.push(link)
      } else {
        item.links = [link]
      }
      delete item.specs.ann;
    }
  }
}

fs.writeFileSync(path.join(__dirname, "..", "chaingear.json"), JSON.stringify(chaingear, null, 4));