//// Author: Jakub Król <jakub.krol@poczta.fm>

var http = require("http");
var express = require("express");
var app = express();

app.get("/:ip", function (request, response){
  
  var ip = request.params.ip;
  var options = { hostname: "check.getipintel.net", path:"/check.php?ip="+ip+"&contact=xyz@gmail.com&format=json&flags=b"};
  var result = {"status":"tryagain", "allow": false};
  http.get(options, function(res){
    var buffer = "";
    res.on("data", function(data){
      buffer += data.toString();
      });
    res.on("end", function(){
      buffer = JSON.parse(buffer.toString());
      console.log(buffer);
      var a = buffer.result-0;
      if(buffer.status == "success"){
        result.status = "ok";
        if(a < 0.5){
          result.allow = true;
        }
        response.send(result);
      }
      else{
        response.send(result);
      }
    });
  });
});
app.listen(4003);
