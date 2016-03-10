"use strict";

var express = require('express');
var exphbs  = require('express-handlebars');
var pg = require("pg");
var argv = require("minimist")(process.argv.slice(2));

var app = express();
var pgclient;

app.engine('handlebars', exphbs({
  defaultLayout: false,
  helpers: {
    debug: (smth) => {
      return JSON.stringify(smth, null, 2);
    }
  }
}));

app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
  const data = {};
  pgclient.query("SELECT ip, bot = -1 as bot FROM adresy WHERE EXISTS(SELECT 1 FROM results WHERE results.ip = adresy.ip) and bot in (-1,1)", (err, result) => {
    if(err) throw err;
    result.rows.forEach((row) => {
      if(data[row.ip] === undefined) data[row.ip] = {services: {}};
      data[row.ip].bot = row.bot;
    });
    pgclient.query("SELECT * FROM results ORDER BY ip, service", (err, result) => {
      if(err) throw err;
      result.rows.forEach((row) => {
        if(data[row.ip] === undefined) return;
        row.bot = row.suggestion == "deny";
        row.correct = row.bot == data[row.ip].bot;
        data[row.ip]["services"][row.service] = row;
      });
      res.render('index', {data});
    });
  });
});

pg.connect(argv.pg_host, function(err, client, done) {
  if(err) throw err;
  pgclient = client;
  app.listen(8000);
  console.log("Ready on 8000");
});
