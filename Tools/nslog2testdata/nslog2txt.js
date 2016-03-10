"use strict";

const byline = require("byline"),
      fs = require("fs")
;

const logstream = byline(fs.createReadStream('log.txt'));

const addresses = [];
logstream.on('data', (line) => {
  let row = JSON.parse(line);
  if(!row.params.ip) return;
  addresses.push(row.params.ip);
});

logstream.on('end', () => {
  fs.writeFileSync("ips.txt", addresses.join("\n"));
});
