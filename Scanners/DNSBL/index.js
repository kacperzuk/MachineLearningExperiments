var express = require("express");
var app = express();
var dns = require("native-dns");
var async = require("async");
var blacklists = require("./blacklists");

// make user we're always using local DNS resolver
dns.platform.name_servers = [{address: "127.0.0.1"}]

app.get("/:ip", function(request, response){
  var ip = request.params.ip.split(".").reverse().join(".");
  var result = {"status" : "ok", "blacklists":{}};
  async.each(blacklists, function (blacklist, callback){
    var s = Date.now();
    dns.lookup(ip+blacklist, function(err){
      var t = (Date.now() - s)/1000;
      if(t > 2) { // slooow DNSBL
        console.log(blacklist, "took", t, "seconds to reply for address", request.params.ip);
        console.log(err);
      }
      result.blacklists[blacklist] = !err;
      callback();
    });
  },
  function(){
    response.send(result);
  });
});
app.listen(4002);
