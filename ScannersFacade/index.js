"use strict";

const http = require("http");
const url = require("url");
const express = require("express");
const bodyParser = require("body-parser");

const hostsManager = url.parse(process.env.hostsManagerUrl || "http://127.0.0.1:2000/");

const scanners = {
  "revdns": 4000,
  "whois": 4001,
  "dnsbl": 4002,
  "shodan": 4004
};

let hosts = [];

if(process.env.LOCALHOST_ONLY)
  hosts.push("127.0.0.1");


const facade = express();
facade.get("/:ip", (req, res) => {
  if(hosts.length === 0) {
    res.send({"status": "trylater"});
    return;
  }

  const promises = [];
  const ret = {"status": "ok"};
  for(let scanner in scanners) {
    promises.push(new Promise((resolve) => {
      let host = hosts[0];
      let dest = "http://"+host+":"+scanners[scanner]+"/"+req.params.ip;
      let handleFail = () => {
        console.log("Connection fail with", host, "for scanner", scanner);
        if(!process.env.LOCALHOST_ONLY)
          removeHost();
      };
      let removeHost = () => {
        hostsManager.path = "/"+host;
        let r = http.request(hostsManager).end();
        let i = hosts.indexOf(host);
        if(i > -1)
          hosts.splice(i, 1);
        host = hosts[0];
        dest = "http://"+host+":"+scanners[scanner]+"/"+req.params.ip;
      };
      let handleResp = (res) => {
        let buf = ""
        res.on('data', (chunk) => buf += chunk.toString());
        res.on('end', () => {

          let result = JSON.parse(buf);
          if(result.status === "ok") {
            delete result.status;
            ret[scanner] = result;
            resolve();
          } else {
            console.log("Retry after", scanner, "from", host, "returned", result)
            removeHost();
            let r = http.request(dest, handleResp);
            r.on('error', handleFail);
            r.end();
          }
        });
      }
      let r = http.request(dest, handleResp);
      r.on('error', handleFail);
      r.end();
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
  console.log("Received new hosts", hosts);
});
management.listen(3001);

function refreshHosts() {
  hostsManager.method = "GET";
  let r = http.request(hostsManager, (res) => {
    let buf = "";
    res.on("data", (chunk) => buf += chunk.toString());
    res.on("end", () => {
      hosts = JSON.parse(buf)["hosts"];
    });
  });
  r.on('error', () => {
    console.log("Couldn't refresh hosts, connection error");
  });
  r.end();
  hostsManager.method = "POST";
  setTimeout(refreshHosts, 30*1000);
}

if(!process.env.LOCALHOST_ONLY)
  refreshHosts();
