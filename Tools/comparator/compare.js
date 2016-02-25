"use strict";

const pg = require("pg");
const argv = require("minimist")(process.argv.slice(2));
const pad = require("pad");
const colors = require("colors/safe");

function pprint(scans) {
  process.stdout.write("---------------------------------------------------------------------------\n");
  process.stdout.write("| ");
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
    let padd = 25;
    if(res == "allow") {
      res = colors.green(res);
      padd += res.length - 5;
    } else {
      res = colors.red(res);
      padd += res.length - 4;
    }
    process.stdout.write(pad("Result: "+res+" ("+s.factor+")", padd));
    process.stdout.write(" | ");
  });

  process.stdout.write("\n---------------------------------------------------------------------------\n");
}

pg.connect(argv.pg_host, function(err, client, done) {
  if(err) throw err;


  client.query("SELECT DISTINCT ip FROM scans ORDER BY ip LIMIT 10", (err, result) => {
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
