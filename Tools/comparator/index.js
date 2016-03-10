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
  const columns = [ "getipintel", "nh1", "nh2", "nhml" ];
  const stats = {};
  columns.forEach((col) => {
    stats[col] = {
      false_bots: 0,
      false_nonbots: 0,
      true_bots: 0,
      true_nonbots: 0
    };
  });
  pgclient.query("SELECT ip, bot = -1 as bot FROM adresy WHERE EXISTS(SELECT 1 FROM results WHERE results.ip = adresy.ip) and bot in (-1,1)", (err, result) => {
    if(err) throw err;
    result.rows.forEach((row) => {
      if(data[row.ip] === undefined) data[row.ip] = {services: {}};
      data[row.ip].bot = row.bot;
    });
    pgclient.query("SELECT * FROM results ORDER BY ip", (err, result) => {
      if(err) throw err;
      result.rows.forEach((row) => {
        if(data[row.ip] === undefined) return;
        row.bot = row.suggestion == "deny";
        row.correct = row.bot == data[row.ip].bot;
        if(row.bot && row.correct) {
          stats[row.service].true_bots += 1;
        } else if(row.bot && !row.correct) {
          stats[row.service].false_bots += 1;
        } else if(!row.bot && row.correct) {
          stats[row.service].true_nonbots += 1;
        } else if(!row.bot && !row.correct) {
          stats[row.service].false_nonbots += 1;
        }
        data[row.ip]["services"][row.service] = row;
      });

      for(let ip in data) {
        const s = data[ip].services;
        data[ip].services = columns.map((service) => s[service]);
      };
      const new_stats = columns.map((col) => {
        return { name: col, stats: stats[col]};
      });
      res.render('index', {data, columns, stats:new_stats});
    });
  });
});

pg.connect(argv.pg_host, function(err, client, done) {
  if(err) throw err;
  pgclient = client;
  app.listen(8001);
  console.log("Ready on 8001");
});
