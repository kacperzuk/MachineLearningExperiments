// Author: Jakub Król <jakub.krol@poczta.fm>

var dns = require("dns");
var express = require("express");
var app = express();

app.get("/:ip", function(request, response){

  var my_ip = request.params.ip;

  var success = {"status":"ok", "hostnames":"hostnames"};
  var failure = {"status":"tryagain", "reason":"reason"};

  dns.reverse(my_ip, function(err, hostnames){

    if (err){

      failure.reason = err.message;
      response.send(JSON.stringify(failure));

      return;
    }  else{

      success.hostnames = hostnames;
      response.send(JSON.stringify(success));
    }
  });

});

app.listen(4000);
console.log("Server Running on 4000");
