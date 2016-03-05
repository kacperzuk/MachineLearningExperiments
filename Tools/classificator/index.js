var express = require('express');
var exphbs  = require('express-handlebars');
var dns = require("dns");
var whois = require("whois-json");
var https = require("https");
var pg = require("pg");
var argv = require("minimist")(process.argv.slice(2));

var app = express();

var pgclient;

app.engine('handlebars', exphbs({defaultLayout: false}));
app.set('view engine', 'handlebars');

app.get('/classify/:class/:ip', (req, res) => {
  pgclient.query("update adresy set bot = $1 where ip = $2", [req.params.class, req.params.ip], (err, result) => {
    res.redirect("/");
  });
});

app.get('/shodan/:ip', (req, res) => {
  https.get(`https://api.shodan.io/shodan/host/${req.params.ip}?key=aH7F5pcxsC3U9i7hmPUYA6vwdehxxNeP`, (r) => {
    var buf = "";
    r.on("data", (d) => buf += d.toString());
    r.on("end", () => {
      res.send(JSON.stringify(JSON.parse(buf), null, 2));
    });
  });
});

app.get('/whois/:ip', (req, res) => {
  whois(req.params.ip, {verbose: true}, (err, result) => {
    if(err)
      res.send(err);
    else
      res.send(JSON.stringify(result, null, 2));
  });
});

app.get('/revdns/:ip', (req, res) => {
  dns.reverse(req.params.ip, (err, hostnames) => {
    if(!hostnames || hostnames.length < 1) {
      res.send('brak revdns');
    } else {
      res.send(hostnames[0]);
    }
  });
});

app.get('/', (req, res) => {
  var order = "DESC";
  if(Math.random() >= 0.5)
    order = "ASC";
  pgclient.query(`SELECT ip, reports FROM niesklasyfikowane order by reports ${order} OFFSET random() * (select least(count(*), 20) from niesklasyfikowane) limit 1`, (err, result) => {
    var ip = result.rows[0].ip;
    var reports = result.rows[0].reports;
    res.render('index', {ip, reports});
  });
});

pg.connect(argv.pg_host, function(err, client, done) {
  if(err) throw err;
  pgclient = client;
  app.listen(8000);
  console.log("Ready on 8000");
});
