"use strict";

const http = require("http");
const app = require("express")();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.post("*", (req, res) => {
  res.end();
  if(!req.body) return;
  console.log(req.body);
});
app.listen(2000);
