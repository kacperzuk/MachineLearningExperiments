const iptoasn = require("iptoasn")("cache/");
const express = require("express");

var app = express();
var ready = 0;

iptoasn.lastUpdated(function(err, t) {
  if (t > 2) {
    iptoasn.load({ update: true });
  } else {
    iptoasn.load();
  }
});
iptoasn.on("cache_locked", function() {
  iptoasn.load();
});

iptoasn.on("ready", function() {
  ready = 1;
});

app.get("/:ip", function (request, response){
  var result = {"status":"ok", "as":"as"};
  var ip = request.params.ip;
  if (ready == 1){
    result.as = iptoasn.lookup(ip);
  } else {
    result.status = "tryagain";
  }
  response.send(result);
}).listen(4005);

console.log("AS scanner running on 4005");