// Author: Jakub Król <jakub.krol@poczta.fm>

var dns = require("dns");
var express = require("express");
var app = express();

app.get("/:ip", function(request, response){

  var my_ip = request.params.ip;

  var success = {"status":"ok", "hostnames":"hostnames"};

  try {
    dns.reverse(my_ip, function(err, hostnames){
      if(hostnames)
        success.hostnames = hostnames;
      else
        success.hostnames = [];
      response.send(JSON.stringify(success));
    });
  } catch(e) {
    if(['EINVAL'].indexOf(e.code) > -1) {
      success.hostnames = [];
      response.send(JSON.stringify(success));
    } else {
      throw e;
    }
  }

});

app.listen(4000);
console.log("RevDNS scanner Running on 4000");
