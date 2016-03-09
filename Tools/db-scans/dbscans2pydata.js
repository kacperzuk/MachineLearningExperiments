"use strict";

const pg = require("pg");
const argv = require("minimist")(process.argv.slice(2));
const fs = require("fs");

pg.connect(argv.pg_host, function(err, client, done) {
  if(err) throw err;
  console.log("Fetching data...");
  client.query("SELECT scans.ip, bot = -1, result FROM scans INNER JOIN adresy ON adresy.ip = scans.ip AND adresy.bot is not null AND adresy.bot <> 0", (query_err, res) => {
    if(query_err) throw query_err;
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
    const data = "# -*- coding:utf8 -*-\n\nsamples = "+JSON.stringify(addresses, null, 4).replace(/false/g, "False").replace(/null/g, "None").replace(/true/g, "True")
    console.log("Writing data...");
    fs.writeFileSync("data.py", data);
    console.log("Done");
    done();
    pg.end();
  });
});
