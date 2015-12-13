"use strict";

const http = require("http");
const app = require("express")();
const bodyParser = require("body-parser");
const provider = require("./providers/dummy.js");

const hosts = {};

app.use(bodyParser.json());
app.post("*", (req, res) => {
  res.end();

  if(!req.body) return;
  if(!req.body.scanner || !req.body.host) return;
  if(!hosts[req.body.host]) return;

  const host = hosts[req.body.host]
  let i = host.indexOf(req.body.scanner);
  if(i > -1) {
    host.splice(i, 1);
  }

  if(host.length === 0) {
    provider.destroyInstance(req.body.host, (err) => {
      if(err) {
        console.log("Error why destroying instance", req.body.host, err);
      } else {
        delete hosts[req.body.host];
      }
    });
  }
});

app.listen(2000);
