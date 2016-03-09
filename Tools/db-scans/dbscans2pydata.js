"use strict";

const pg = require("pg");
const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs");

pg.connect(argv.pg_host, function(err, client, done) {
  if(err) throw err;
  console.log("Counting data...");
  client.query("SELECT (SELECT COUNT(*) FROM adresy WHERE bot = 1) as nonbots, (SELECT COUNT(*) FROM adresy WHERE bot = -1) as bots", (err, res) => {
    if(err) throw err;
    res = res.rows[0];
    let bots_count = parseInt(res.bots);
    let nonbots_count = parseInt(res.nonbots);
    let total_count = bots_count + nonbots_count;

    if(argv.ratio) {
      let current_ratio = bots_count/total_count;
      argv.ratio /= 100;
      if(current_ratio > argv.ratio) {
        bots_count = parseInt(nonbots_count / (1-argv.ratio) * argv.ratio);
      } else {
        nonbots_count = parseInt(bots_count / argv.ratio * (1 - argv.ratio));
      }
    }

    total_count = bots_count + nonbots_count;
    let ratio = bots_count / total_count;

    console.log("DB data:", res);
    console.log("Used data: ", { nonbots_count, bots_count });

    console.log("Fetching data...");
    client.query(`
      WITH data AS (
        SELECT scans.ip, bot = -1 as bot, result FROM scans INNER JOIN adresy ON adresy.ip = scans.ip AND adresy.bot is not null AND adresy.bot <> 0
      )
      (SELECT * FROM data WHERE bot = 't' LIMIT ${bots_count})
      UNION
      (SELECT * FROM data WHERE bot = 'f' LIMIT ${nonbots_count})
    `, (err, res) => {
      if(err) throw err;
      console.log("Fetched", res.rows.length, "rows.");
      console.log("Parsing data...");
      const addresses = res.rows.map((v) => {
        return {
          ip: v.ip,
          bot: v.bot,
          data: JSON.parse(v.result)
        };
      });
      console.log("Parsed.");
      console.log("Formatting data...");
      let data = "# -*- coding:utf8 -*-";
      data += "\n#Number of bots: "+bots_count;
      data += "\n#Number of nonbots: "+nonbots_count;
      data += "\n#Total: "+total_count;
      data += "\n#Bots to total ratio: "+ratio;
      data += "\n\nsamples = ";
      data += JSON.stringify(addresses, null, 4)
                  .replace(/false/g, "False")
                  .replace(/null/g, "None")
                  .replace(/true/g, "True");
      console.log("Writing data...");
      fs.writeFileSync("data.py", data);
      console.log("Done");
      done();
      pg.end();
    });
  });
});
