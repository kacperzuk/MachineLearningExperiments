"use strict";

const http = require("http");
const url = require("url");
const express = require("express");
const bodyParser = require("body-parser");

const hostsManager = url.parse(process.env.hostsManagerUrl || "http://127.0.0.1:2000/");

const scanners = {
  "revdns": 4000,
  "whois": 4001,
  "dnsbl": 4002
};

let hosts = [];


const facade = express();
facade.get("/:ip", (req, res) => {
  if(hosts.length === 0) {
    res.send({"status": "trylater"});
    return;
  }

  const host = hosts[0];
  const promises = [];
  const ret = {"status": "ok"};
  for(let scanner in scanners) {
    promises.push(new Promise((resolve) => {
      let dest = "http://"+host+":"+scanners[scanner]+"/"+req.params.ip;
      http.request(dest, (res) => {
        let buf = ""
        res.on('data', (chunk) => buf += chunk.toString());
        res.on('end', () => {
          let result = JSON.parse(buf);
          if(result.status === "ok") {
            delete result.status;
            ret[scanner] = result;
          } else {

            // notify hosts manager
            // somehow retry

          }
          resolve();
        });
      }).end();
    }).catch((e) => console.log(e)));
  }

  Promise.all(promises).then(() => {
    res.send(ret);
  });
});
facade.listen(3000);


const management = express();
management.use(bodyParser.json());
management.post("*", (req, res) => {
  res.end();
  if(!req.body || !(req.body instanceof Array)) return;
  hosts = req.body;
});
management.listen(3001);

http.request(hostsManager, (res) => {
  let buf = "";
  res.on("data", (chunk) => buf += chunk.toString());
  res.on("end", () => {
    hosts = JSON.parse(buf)["hosts"];
  });
}).end();

hostsManager.method = "POST";
