// Author: Jakub Król <jakub.krol@poczta.fm>
var whois = require("whois-json");
var express = require("express");
var app = express();

app.get("/:url", function(request, response){

  var success = {"status":"ok", "whois":"whois"};
  var failure = {"status":"tryagain", "reason":"reason"};
  var url = request.params.url;
  whois(url, function(err, result){
    if(err){
      failure.reason = err.message;
      response.send(failure);
    } else{
      if(result.error.indexOf("429")>-1){
        failure.status = "error";
        failure.reason = result;
        response.send(failure);
      }
      if(result.hasOwnProperty("error")){
        failure.reason = result;
        response.send(failure);
      }else{
        success.whois = result;
        response.send(success);
      }
    }
  });
});
app.listen(2000);
console.log("server running on 2000");
