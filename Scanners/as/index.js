const iptoasn = require("iptoasn")("cache/");
const express = require("express");

var app = express();


app.get("/:ip", function (request, response){
  var ip = request.params.ip;
  var result = {"status":"ok", "AS":"as"};

  iptoasn.lastUpdated(function(err, t) {
    if (t > 31) {
    iptoasn.load({ update: true });
    } else {
    iptoasn.load();
    }
  })
  iptoasn.on('cache_locked', function() {
   console.log("cache_locked");
    iptoasn.load();
  });
  iptoasn.on("ready", function() {
  try{
  result.as = iptoasn.lookup(ip);
  } catch(e){
  result.status = "tryagain";
  console.log(e);
  }
   response.send(result);
   });
}).listen(4006)
console.log("AS scanner running on 4006")