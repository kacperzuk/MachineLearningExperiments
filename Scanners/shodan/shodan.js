// Author: Jakub Król <jakub.krol@poczta.fm>

var https = require("https");
var express = require("express");
var app = express();

app.get("/:ip", function(request, response){
  var ip = request.params.ip;
  var options = {hostname: "api.shodan.io", path: "/shodan/host/" + ip + "?key=aH7F5pcxsC3U9i7hmPUYA6vwdehxxNeP"};
  var result = {status: "tryagain", shodan: "shodan"};

  https.get(options, function(res){
    var buffer = "";
    res.on("data", function(data){
    	buffer += data.toString();
    });
    res.on("end", function(){
      buffer = JSON.parse(buffer.toString());
      result.status = "ok";
      result.shodan = buffer;
      response.send(result);
    })
  }).on("error", function(error){
  	result.shodan = error.message;
  	response.send(result);
  })
}).listen(4004);