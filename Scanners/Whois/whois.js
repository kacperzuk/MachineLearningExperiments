// Author: Jakub Król <jakub.krol@poczta.fm>
var whois = require("whois-json");
var express = require("express");
var app = express();

app.get("/:url", function(request, response){

  var success = {"status":"ok", "whois":"whois"};
  var failure = {"status":"tryagain", "reason":"reason"};
  var url = request.params.url;
  whois(url, {verbose: true}, function(error, result){
    if(error){
      failure.reason = error.message;
      response.send(failure);
    } else if((result.error) && (result.error.includes("429"))){
      failure.status = "error";
      failure.reason = result;	
      response.status(500);
      response.send(failure);
    } else if(result.error){
      failure.reason = result;
      response.send(failure);
      response.status(503);
    } else{
      success.whois = result;
      response.send(success);
    }
    
  });
});
app.listen(4001);
console.log("server running on 4001");
