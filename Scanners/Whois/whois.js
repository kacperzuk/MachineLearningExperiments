// Author: Jakub Król <jakub.krol@poczta.fm>
var whois = require("./whois-json.js");
var express = require("express");
var app = express();

app.get("/:url", function(request, response){

  var url = request.params.url;
  whois(url, function(err, result){

    if(err){
      response.send(err.message);
    }else{
      response.send(JSON.stringify(result, null, 2));
    }
  });
});
app.listen(3000);
console.log("server running on 3000");
