"use strict";

const http = require("http");
const url = require("url");
const splof = require("splof")();
const app = require("express")();
const bodyParser = require("body-parser");

const hostsManager = url.parse(require("config.json").hostsManagerUrl);
hostsManager.method = "POST";

splof
  .strategies([
    (err, res) => {
      res.on('data', (r) => { console.log(r.toString()); });
      return false;
    }
  ])
  .onRetry((err, res) => {
    let host = res.rocky.options.prev_target;
    let scanner = (new RegExp("^[/]([^/]+)")).match(res.url)[1];
    if(scanner && faulty) {
      let req = http.request(hostsManager);
      req.write(JSON.stringify({scanner, host}));
      req.end();
    }
  })
;

splof.listen(3000);

app.use(bodyParser.json());
app.post("*", (req, res) => {
  res.end();
  if(!req.body || !(req.body.scanners instanceof Object)) return;
  for(let scanner in req.body.scanners) {
    let servers = req.body.scanners[scanner];
    splof.get(`/${scanner}`).balance(servers);
  };
});
app.listen(3001);
