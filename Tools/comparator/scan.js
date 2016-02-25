"use strict";

const request = require("request");
const pg = require("pg");
const argv = require("minimist")(process.argv.slice(2));
const stdin = require("byline")(process.stdin);

const urls = {
  nh2: argv.nh2_url || "http://127.0.0.1:5000/",
  nhml: argv.nhml_url || "http://127.0.0.1:5001/",
  nh1: "http://v1.nastyhosts.com/",
  getipintel: "http://check.getipintel.net/check.php?contact=xyz@gmail.com&format=json&flags=b&ip="
};

if(!(argv.nh2 || argv.nh1 || argv.nhml || argv.getipintel)) {
  console.log("Usage:");
  console.log("   ", process.argv[1], "[--pg_host=host] [services]");
  console.log("Services (at least one required):");
  console.log("    --nh2");
  console.log("    --nh1");
  console.log("    --nhml");
  console.log("    --getipintel");
  process.exit(1);
}

pg.connect(argv.pg_host, function(err, client, done) {
  if(err) throw err;

  client.query(`
    CREATE TABLE IF NOT EXISTS scans (
      ip text,
      service text,
      time integer,
      suggestion text,
      factor real,
      primary key (ip, service)
    );
  `);

  function upsert(data, callback) {
    client.query("SELECT 1 FROM scans WHERE ip=$1 AND service=$2", data.slice(0, 2), (err, result) => {
      if(result.rows.length > 0)
        client.query("UPDATE scans SET time=$3, suggestion=$4, factor=$5 WHERE ip=$1 AND service=$2", data, callback);
      else
        client.query("INSERT INTO scans (ip, service, time, suggestion, factor) VALUES ($1, $2, $3, $4, $5)", data, callback);
    });
  }

  function scanIP(ip) {
    let promises = [];

    if(argv.nh1) {
      promises.push(new Promise((resolve) => {
        request({
            uri: urls.nh1+ip,
            time: true
        }, function(err, resp, body) {
          body = JSON.parse(body);
          let timeToProcess = resp.elapsedTime;
          let suggestion = body.suggestion;
          let factor = suggestion == "allow" ? 1 : 0;

          upsert([ip, 'nh1', timeToProcess, suggestion, factor], resolve);
        });
      }));
    }

    if(argv.getipintel) {
      promises.push(new Promise((resolve) => {
        request({
            uri: urls.getipintel+ip,
            time: true
        }, function(err, resp, body) {
          body = JSON.parse(body);
          let timeToProcess = resp.elapsedTime;
          let suggestion = body.result < 0.5 ? 'allow' : 'deny';
          let factor = 1 - parseFloat(body.result);
          upsert([ip, 'getipintel', timeToProcess, suggestion, factor], resolve);
        });
      }));
    }

    if(argv.nh2) {
      promises.push(new Promise((resolve) => {
        request({
            uri: urls.nh2+ip,
            time: true
        }, function(err, resp, body) {
          body = JSON.parse(body);
          let timeToProcess = resp.elapsedTime;
          let suggestion = body.suggestion;
          let factor = body.factor;
          upsert([ip, 'nh2', timeToProcess, suggestion, factor], resolve);
        });
      }));
    }

    return Promise.all(promises);
  }

  let promises = [];
  stdin.on('data', (line) => {
    promises.push(scanIP(line.toString().trim()));
  });
  stdin.on('end', () => {
    Promise.all(promises).then(() => { done(); pg.end() });
  });
});
