const iptoasn = require("iptoasn")("cache/");
const express = require("express");

var app = express();

iptoasn.lastUpdated(function(err, t) {
  if (t > 2) {
    iptoasn.load({ update: true });
  } else {
    iptoasn.load();
  }
});

iptoasn.on("cache_locked", function() {
  iptoasn.load();
  app.get("/:ip", function (request, response){
    var result = {"status":"tryagain", "as":"as"};
    response.send(result);
  }).listen(4005);
});

iptoasn.on("ready", function() {
  app.get("/:ip", function (request, response){
    var ip = request.params.ip;
    var result = {"status":"ok", "as":"as"};
    result.as = iptoasn.lookup(ip);
    response.send(result);
  }).listen(4005);
});

console.log("AS scanner running on 4005");