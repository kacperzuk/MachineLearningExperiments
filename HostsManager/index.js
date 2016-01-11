"use strict";

const http = require("http");
const app = require("express")();
const provider = require("./providers/aws.js");

let hosts = [];
let balancer = process.env.balancer || "127.0.0.1";

app.get("*", (req, res) => {
  res.send({ status: "ok", hosts });
});

app.post("/:host", (req, res) => {
  res.end();

  const host = req.params.host;

  if(hosts.indexOf(host) < 0) return;

  hosts.splice(hosts.indexOf(host), 1);

  provider.destroyInstance(host);
  provider.createInstance((host) => {
    setTimeout(() => {
      hosts.push(host);
      let postData = JSON.stringify(hosts);
      let req = http.request({
        hostname: balancer,
        port: 3001,
        path: "/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": postData.length
        }
      });
      req.on('error', () => {});
      req.write(postData);
      req.end();
    }, 30*1000);
  });
});

app.listen(2000);
provider.init((h) => hosts = h);
setTimeout(() => {
  provider.listInstances((h) => hosts = h);
}, 30*1000);
