"use strict";

const request = require("request");
const pg = require("pg");
const argv = require("minimist")(process.argv.slice(2));

let client;

const services = {
  nh1: (ip) => {
    return new Promise((resolve) => {
      request({
        uri: "http://v1.nastyhosts.com/"+ip,
        time: true
      }, function(err, resp, body) {
        body = JSON.parse(body);
        if(body.status != 200) {
          console.log(body);
          process.exit(2);
        }
        let timeToProcess = resp.elapsedTime;
        let suggestion = body.suggestion;
        let factor = suggestion == "allow" ? 1 : 0;

        upsert([ip, 'nh1', timeToProcess, suggestion, factor], resolve);
      });
    });
  },
  nh2: (ip) => {
    const url = argv.nh2_url || "http://127.0.0.1:5000/";
    return new Promise((resolve) => {
      request({
        uri: url+ip,
        time: true
      }, function(err, resp, body) {
        body = JSON.parse(body);
        let timeToProcess = resp.elapsedTime;
        let suggestion = body.suggestion;
        let factor = body.factor;
        upsert([ip, 'nh2', timeToProcess, suggestion, factor], resolve);
      });
    });
  },
  getipintel: (ip) => {
    let url = "http://check.getipintel.net/check.php?contact=xyz@gmail.com&format=json&flags=b&ip=";
    return new Promise((resolve) => {
      request({
        uri: url+ip,
        time: true
      }, function(err, resp, body) {
        if(!body) {
          console.log("Getipintel empty body (rate limit hit)");
          process.exit(3);
        }
        body = JSON.parse(body);
        if(body.status != 'success') {
          console.log(body);
          process.exit(2);
        }
        let timeToProcess = resp.elapsedTime;
        let suggestion = body.result < 0.5 ? 'allow' : 'deny';
        let factor = 1 - parseFloat(body.result);
        upsert([ip, 'getipintel', timeToProcess, suggestion, factor], resolve);
      });
    });
  },
  nhml: (ip) => {
    let url = argv.nhml_url || "http://127.0.0.1:5001/";
    return false;
  }
}

function upsert(data, callback) {
  console.log(data);
  client.query("SELECT 1 FROM results WHERE ip=$1 AND service=$2", data.slice(0, 2), (err, result) => {
    if(result.rows.length > 0)
      client.query("UPDATE results SET time=$3, suggestion=$4, factor=$5 WHERE ip=$1 AND service=$2", data, callback);
    else
      client.query("INSERT INTO results (ip, service, time, suggestion, factor) VALUES ($1, $2, $3, $4, $5)", data, callback);
  });
}

function getStats() {
  client.query(`SELECT
      (SELECT COUNT(*) FROM results WHERE service = $1) as done,
      (SELECT COUNT(*) FROM adresy WHERE bot IN (1,-1)) as total
  `, [argv.service], (err, res) => {
    if(err) throw err;
    console.log(res.rows);
  });
}

function processBatch(done) {
  console.log("Using service", argv.service);
  getStats();
  client.query("SELECT ip FROM adresy WHERE bot IN (1,-1) AND NOT EXISTS (SELECT 1 FROM results WHERE results.ip = adresy.ip AND service = $1) LIMIT 15", [argv.service], (err, res) => {
    if(err) throw err;
    if(res.rows.length == 0) {
      done();
    } else {
      const promises = [];
      res.rows.forEach((row) => {
        promises.push(services[argv.service](row.ip));
      });
      Promise.all(promises).then(() => {
        if(service == "getipintel")
          setTimeout(() => {
            processBatch(done);
          }, 1000*70);
        else
          processBatch(done);
      });
    }
  });
}

if(!argv.service) {
  console.log("--service=<service> required!!");
  process.exit(1);
}

pg.connect(argv.pg_host, function(err, pgclient, done) {
  client = pgclient;
  if(err) throw err;

  processBatch(() => {
    console.log("Done");
    done();
    pg.end();
  });
});
