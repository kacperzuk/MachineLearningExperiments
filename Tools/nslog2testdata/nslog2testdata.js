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
  "dnsbl": "http://127.0.0.1:4002"
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

var processed_addresses = [];


logstream.on('end', () => {
  function processBatch() {
    const promises = [];
    const batch = addresses.splice(0, 20);
    const start = Date.now();
    batch.forEach((addr) => {
      for(let key in scanners) {
        let scanner = scanners[key];
        promises.push(new Promise((resolve) => {
          http.request(scanner+"/"+addr.ip, (res) => {
            let body = new Buffer(0);
            res.on('data', (d) => { body = Buffer.concat([body, d]); });
            res.on('end', () => {
              const res = JSON.parse(body);
              addr[key] = null;
              if(res.status === "ok") {
                addr[key] = res[key];
              }
              resolve();
            });
          }).end();
        }));
      };
    });
    Promise.all(promises).then(() => {
      console.log("Left:", addresses.length, "\t\tTime to process batch of",batch.length,":", (Date.now() - start)/1000);
      [].push.apply(processed_addresses, batch);
      if(addresses.length > 0)
        processBatch()
      else
        fs.writeFile("data.py", "# -*- coding: utf8 -*-\n\nsamples = "+JSON.stringify(processed_addresses, null, 4).replace(/false/g, "False").replace(/null/g, "None").replace(/true/g, "True"));
    }).catch((e) => console.log(e));;
  }
  processBatch();
});

