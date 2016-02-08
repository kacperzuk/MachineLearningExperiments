// Author: Jakub Król <jakub.krol@poczta.fm>

var dns = require("dns");
var express = require("express");
var app = express();

app.get("/:ip", function(request, response){

  var my_ip = request.params.ip;

  var success = {"status":"ok", "hostnames":"hostnames"};

  dns.reverse(my_ip, function(err, hostnames){
    if(hostnames)
      success.hostnames = hostnames;
    else
      success.hostnames = [];
    response.send(JSON.stringify(success));
  });

});

app.listen(4000);
console.log("Server Running on 4000");
