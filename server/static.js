var express = require('express'),
    config = require('../config.json'),
    httpProxy = require('http-proxy'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    app = express(),
    server,
    proxy;

/**
 * MIDDLEWARES:
 * ************
 */
proxy = httpProxy.createServer({ target: 'http://localhost:8080' });
app.use(function(req, res, next) {
  if (req.url.match(/\/api\/.*/))
    return proxy.proxyRequest(req, res, { host: 'http://localhost' }, { port: '8080' });
  else
    return next();
});
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * ROUTES:
 * *******
 */
app.get('/app/', function(req, res) {
  res.send(fs.readFileSync(__dirname + '/../' + config.static.path + '/app.html', 'utf8'));
});
app.get('/', function(req, res) {
  res.send(fs.readFileSync(__dirname + '/../' + config.static.path + '/site.html', 'utf8'));
});
app.get('/*', express.static(__dirname + '/../' + config.static.path));

/**
 * EXPORT:
 * *******
 */
exports.app = app;
exports.start = function(port) {
  server = http.createServer(app).listen(port, function() {
    console.log('Static server listening on port ' + port);
  });
};
exports.stop = function() {
  if (server)
    server.close();
};
