"use strict";

const pg = require("pg");
const argv = require("minimist")(process.argv.slice(2));
const pad = require("pad/lib/colors");
const colors = require("colors/safe");

function pprint(scans) {
  process.stdout.write(pad("", 103, { char: "-" }));
  process.stdout.write("\n| ");
  process.stdout.write(pad("", 15));
  process.stdout.write(" | ");
  scans.forEach((s) => {
    process.stdout.write(pad("Service: "+s.service, 25));
    process.stdout.write(" | ");
  });
  process.stdout.write("\n");

  process.stdout.write("| ");
  process.stdout.write(pad(scans[0].ip, 15));
  process.stdout.write(" | ");
  scans.forEach((s) => {
    process.stdout.write(pad("Time to process: "+s.time+"ms", 25));
    process.stdout.write(" | ");
  });
  process.stdout.write("\n");

  process.stdout.write("| ");
  process.stdout.write(pad("", 15));
  process.stdout.write(" | ");

  scans.forEach((s) => {
    let res = s.suggestion;
    if(res == "allow") {
      res = colors.green(res);
    } else {
      res = colors.red(res);
    }
    process.stdout.write(pad("Result: "+res+" ("+s.factor+")", 25));
    process.stdout.write(" | ");
  });

  process.stdout.write("\n");
  process.stdout.write(pad("", 103, { char: "-" }));
  process.stdout.write("\n");
}

pg.connect(argv.pg_host, function(err, client, done) {
  if(err) throw err;


  client.query("SELECT DISTINCT ip FROM scans ORDER BY ip", (err, result) => {
    if(err) throw err;

    const promises = [];

    result.rows.forEach((row) => {
      promises.push(new Promise((resolve) => {
        client.query("SELECT * FROM scans WHERE ip = $1 ORDER BY scans", [row.ip], (err, result) => {
          if(err) throw err;
          pprint(result.rows);
          resolve();
        });
      }));
    });

    Promise.all(promises).then(() => {
      done();
      pg.end();
    });
  });
});
