var http = require("http");
var express = require("express");
var app = express();

app.get("/:ip", function (request, response){
  
  var ip = request.params.ip;
  var options = { hostname: "check.getipintel.net", path:"/check.php?ip="+ip+"&contact=xyz@gmail.com&format=json&flags=m"};
  var result = {"status":"tryagain", "allow":"false"};
  http.get(options, function(res){

    res.on("data", function(data){
      data = JSON.parse(data.toString());
      if(data.status = "success"){
        result.status = "ok";
        if(data.result == "0"){
          result.allow = "true";
        }
        response.send(result);
      }
    });
  });
});
app.listen(4003);
