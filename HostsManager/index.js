"use strict";

const http = require("http");
const app = require("express")();
const bodyParser = require("body-parser");
const provider = require("./providers/aws.js");

let hosts = [];
let balancer = null;

app.use(bodyParser.json());
app.get("*", (req, res) => {
  if (balancer) {
    console.warning("Changing balancer from", balancer, "to", req.connection.remoteAddress);
  }
  balancer = req.connection.remoteAddress;
  res.send({ status: "ok", hosts });
});

app.post("*", (req, res) => {
  res.end();

  if(!req.body) return;
  if(!req.body.host) return;

  const host = req.body.host;

  if(hosts.indexOf(host) < 0) return;

  hosts.splice(hosts.indexOf(host), 1);

  provider.destroyInstance(host);
  provider.createInstance((host) => {
    hosts.push(host);
    let postData = JSON.stringify(hosts);
    let req = http.request({
      hostname: balancer,
      port: 3001,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length
      }
    });
    req.write(postData);
    req.end();
  });
});

app.listen(2000);
