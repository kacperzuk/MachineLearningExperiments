const httpProxy = require("http-proxy");
const app = require("express")();

let servers = [
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001"
];

const proxy = httpProxy.createProxyServer();

app.get("/nastyhosts/:ip", (req, res) => {
  req.url = `/${req.params.ip}`;
  let target = servers.shift();
  proxy.web(req, res, { target });
  servers.push(target);
});

app.listen(2999);
