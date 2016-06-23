"use strict";

var pg = require("pg");
var argv = require("minimist")(process.argv.slice(2));
var csv = require("csv-stringify");


const addresses_table = "adresy";
const results_table = "results";
const data = {};
pg.connect(argv.pg_host, function(err, pgclient, done) {
  pgclient.query("SELECT DISTINCT service FROM results order by service", (err, result) => {
    if(err) throw err;
    const columns = result.rows.map((v) => v.service);
    const stats = {};
    columns.forEach((col) => {
      stats[col] = {
        false_bots: 0,
        false_nonbots: 0,
        true_bots: 0,
        true_nonbots: 0,
        total: 0
      };
    });
    const data_stats = { bots: 0, nonbots: 0 };
    pgclient.query(`SELECT
      case when hidden then concat('hidden-', substring(md5(ip) for 12))
      else ip end as name,
      ip,
      bot = -1 as bot
    FROM ${addresses_table} as adresy
    WHERE EXISTS(SELECT 1 FROM ${results_table} as results WHERE results.ip = adresy.ip) and bot in (-1,1)`, (err, result) => {
      if(err) throw err;
      result.rows.forEach((row) => {
        if(data[row.ip] === undefined) data[row.ip] = {services: {}};
        data[row.ip].bot = row.bot;
        data[row.ip].name = row.name;

        if(row.bot) data_stats.bots += 1;
        else data_stats.nonbots += 1;
      });
      data_stats.total = data_stats.bots + data_stats.nonbots;
      data_stats.perc_bots = parseInt(100*data_stats.bots/data_stats.total)+"%";
      data_stats.perc_nonbots = parseInt(100*data_stats.nonbots/data_stats.total)+"%";
      pgclient.query(`SELECT * FROM ${results_table} results ORDER BY ip`, (err, result) => {
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
          stats[row.service].total += 1;
          data[row.ip]["services"][row.service] = row;
        });

        for(let ip in data) {
          const s = data[ip].services;
          data[ip].services = columns.map((service) => s[service]);
        };
        const new_stats = columns.map((col) => {
          return { name: col, stats: stats[col]};
        });
        const perc_stats = new_stats.map((stat) => {
          const t = stat.stats.total || 1;
          const p = (d) => (100.0*d/t).toFixed(2)+"%";

          return {
            ip: stat.ip,
            stats: {
              false_bots: p(stat.stats.false_bots),
              false_nonbots: p(stat.stats.false_nonbots),
              true_bots: p(stat.stats.true_bots),
              true_nonbots: p(stat.stats.true_nonbots),
              overall_accuracy: p(stat.stats.true_bots + stat.stats.true_nonbots)
            }
          };
        });

        done();
        pg.end();

        let csvdata = "";
        const stringifier = csv({delimiter: ';'});
        let row;
        stringifier.on('readable', function() {
          while(row = stringifier.read()) csvdata += row;
        });
        stringifier.on('finish', function() {
          console.log(csvdata);
        });
        stringifier.write(["ip", "is_bot?"] + columns);
        for(let ip in data) {
          let row = [ip, data[ip].bot ? 1 : 0];
          data[ip].services.forEach((col) => {
            if(!col)
              row.push("NULL");
            else
              row.push(col.bot ? 1 : 0);
          });
          stringifier.write(row);
        }
        stringifier.end();
      });
    });
  });
});
