"use strict";

const byline = require("byline"),
      fs = require("fs"),
      http = require("http")
;

http.globalAgent.maxSockets = 100;

const logstream = byline(fs.createReadStream('log.txt'));
const scanners = {
  "hostnames": "http://127.0.0.1:4000",
  "whois": "http://127.0.0.1:4001",
  "dnsbl": "http://127.0.0.1:4002
};


const addresses = [];
logstream.on('data', (line) => {
  let row = JSON.parse(line);
  row.data = JSON.parse(row.data);

  if(!row.params.ip) return;

  if(addresses.some((v) => v.ip == row.params.ip)) return;

  addresses.push({
      ip: row.params.ip,
      bot: row.data.suggestion == "deny"
  });
});


logstream.on('end', () => {
  const promises = [];
  let pending = 0;
  addresses.forEach((addr) => {
    for(let key in scanners) {
      let scanner = scanners[key];
      promises.push(new Promise((resolve) => {
        pending += 1;
        http.request(scanner+"/"+addr.ip, (res) => {
          pending -= 1;
          let body = new Buffer(0);
          res.on('data', (d) => { body = Buffer.concat([body, d]); });
          res.on('end', () => {
            const res = JSON.parse(body);
            addr[key] = null;
            if(res.status === "ok") {
              addr[key] = res[key];
            }
            console.log("Left:", pending);
            resolve();
          });
        }).end();
      }));
    };
  });
  Promise.all(promises).then(() => {
    fs.writeFile("data.py", "# -*- coding: utf8 -*-\n\nsamples = "+JSON.stringify(addresses, null, 4).replace(/false/g, "False").replace(/null/g, "None").replace(/true/g, "True"));
  }).catch((e) => console.log(e));;
});

