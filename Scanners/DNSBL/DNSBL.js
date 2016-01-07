var express = require("express");
var app = express();
var dns = require("dns");
var async = require("async");
var blacklists = require("./blacklists.json");

app.get("/:ip", function(request, response){

  var ip = request.params.ip.split(".").reverse().join("."); 
  var result = {"status" : "ok", "blacklists":{}};
  async.each(blacklists, function (blacklist, callback){
    dns.lookup(ip+blacklist, function(err){

      if(err){
        result.blacklists[blacklist] = "false";
      } else {
        result.blacklists[blacklist] = "true";
      }
      callback();
    });
  },
    function(){
      response.send(result);
    });

});
app.listen(4002);
