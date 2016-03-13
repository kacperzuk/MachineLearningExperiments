"use strict";

// todo: multiprocessing

const pg = require("pg");
const argv = require("minimist")(process.argv.slice(2));

const is_significant = function(x, y) {
  let x1y0 = 0, x1y1 = 0;

  for(let i = 0; i < x.length; i++) {
      x1y0 += x[i] > 0 && y[i] == 0;
      x1y1 += x[i] > 0 && y[i] == 1;
  }

  if(x1y0 > 0.01*x1y1 && x1y1 > 0.01*x1y0) return 0;
  return 1;
}

pg.connect(argv.pg_host, function(err, client, done) {
  if(err) throw err;
  console.warn("Fetching data from database...");
  client.query(`select bot = -1 as bot, result from adresy inner join scans using(ip) where bot is not null and bot <> 0`, (err, res) => {
    if(err) throw err;
    console.warn("Rows to process:", res.rows.length);
    const y = res.rows.map((r) => r.bot ? 1 : 0);
    const raw_x = res.rows.map((r) => JSON.parse(r.result));
    console.warn("Data parsed, extracting keywords...");
    const keywords = extract_keywords(raw_x);
    console.warn("Keywords to process:", keywords.length);
    const significant_keywords = new Set();
    keywords.forEach((key, i, ar) => {
      process.stderr.write(`\rProgress: ${i}/${ar.length}     `);
      let start = -(Date.now());
      const x = is_keyword_in_data(key, raw_x);
      const count = x.reduce((p, c) => p += c > 0, 0);
      if(count > 5 &&
         is_significant(x, y)) {

        significant_keywords.add(key);
      }
    });
    process.stderr.write("\n");
    const reduced_keywords = [];
    significant_keywords.forEach((candidate) => {
      if(Array.from(significant_keywords).every((keyword) => candidate.indexOf(keyword) === -1 || candidate === keyword))
        reduced_keywords.push(candidate);
    });
    process.stdout.write("#-*- coding: utf8 -*-\n\n");
    process.stdout.write("significant_keywords = ");
    process.stdout.write(JSON.stringify(Array.from(significant_keywords).sort())+"\n");
    process.stdout.write("significant_keywords_reduced = ");
    process.stdout.write(JSON.stringify(reduced_keywords.sort())+"\n");

    console.warn("Number of significant keywords:", Array.from(significant_keywords).length);
    console.warn("Number of significant keywords (reduced):", reduced_keywords.length);

    done();
    pg.end();
  });
});

function is_keyword_in_data(keyword, data) {
  const data_mapped = data.map((r) => {
    if(r.revdns.hostnames.some((h) => h.indexOf(keyword) > -1)) {
      return 1;
    }

    if(r.whois.whois)
      if(r.whois.whois.some((s) => {
        for(let i in s.data) {
          if(s.data[i].indexOf(keyword) > -1) return true;
        }
      })) {
        return 1;
      }

    return 0;
  });
  return data_mapped;
}

function extract_keywords(data) {
  const keywords = new Set();
  const extract_from_str = (s) => {
    s.split(/[^a-zA-Z]/)
     .filter((r) => r.length > 0)
     .forEach((r) => keywords.add(r.toLowerCase()));
  };

  data.forEach((r) => {
    r.revdns.hostnames.forEach(extract_from_str);
    if(r.whois.whois)
      r.whois.whois.forEach((s) => {
        for(let i in s.data) {
          extract_from_str(s.data[i]);
        }
      });
  });

  return Array.from(keywords);
}
