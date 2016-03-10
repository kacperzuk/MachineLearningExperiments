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
    var req = dns.Request({
      question: dns.Question({
        name: ip+blacklist,
        type: 'A'
      }),
      server: { address: '127.0.0.1' },
      timeout: 2000
    });
    req.on('timeout', () => {
      console.log("Timeout on", blacklist);
      result.blacklists[blacklist] = false;
    });
    req.on('message', (err, ans) => {
      var listed = false;
      if(err) listed = true;
      if(ans && ans.answer && ans.answer.length > 0) listed = true;
      result.blacklists[blacklist] = listed;
      console.log("Success on", blacklist);
    });
    req.on('end', () => {
      callback();
    });
    req.send();
  },
  function(){
    response.send(result);
  });
});
app.listen(4002);
console.log("DNSBL Scanner running on 4002");
