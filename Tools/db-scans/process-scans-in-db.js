"use strict";

const http = require("http");
const pg = require("pg");
const argv = require("minimist")(process.argv.slice(2));

function scan(client, ip) {
  return new Promise((resolve, reject) => {
    http.get(argv.facade_url+"/"+ip, (res) => {
      let buf = "";
      res.on("data", (chunk) => buf += chunk.toString());
      res.on("end", () => {
        client.query("INSERT INTO scans (ip, result) VALUES ($1, $2)", [ip, buf], (err) => {
          if(err) throw err;
          console.log("Scanned", ip);
          resolve();
        });
      });
    }).on('error', reject);
  });
}

function getStats(client) {
  client.query(`SELECT
    (SELECT count(*) from scans) as done
    ,
    (select count(*) from adresy where bot is not null) as total
  `, (err, res) => {
    if(err) console.log(err);
    else console.log(res.rows);
  });
}

function processBatch(client, done) {
  getStats(client);
  client.query("SELECT ip FROM adresy WHERE bot is not null and not exists (select 1 from scans where scans.ip = adresy.ip) limit 10", (err, res) => {
    if(err) throw err;
    if(res.rows.length == 0) {
      console.log("DONE");
      done();
      return;
    }

    const promises = [];
    res.rows.forEach((v) => {
      promises.push(scan(client, v.ip));
    });
    Promise.all(promises).then(() => {
      processBatch(client, done);
    }).catch((err) => {
      console.log(err);
      done();
    });
  });
}

pg.connect(argv.pg_host, function(err, client, done) {
  processBatch(client, () => {
    done();
    pg.end();
  });
});
