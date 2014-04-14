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
if ('development' === app.get('env'))
  app.use(express.errorHandler());

/**
 * ROUTES:
 * *******
 */
app.get('/app/', function(req, res) {
  var html = fs.readFileSync(__dirname + '/../' + config.static.path + '/app.html', 'utf8');

  if ('development' === app.get('env')) {
    var json = JSON.parse(fs.readFileSync(__dirname + '/../imports.json', 'utf8'));

    res.send(html.replace(/^[^<]*<link href=".*\/tbn\.min\.css" rel="stylesheet">/mg, json.css.map(function(path) {
      return '    <link href="' + path + '" rel="stylesheet">';
    }).join('\n')).replace(/^[^<]*<script src=".*\/tbn\.min\.js"><\/script>/mg, json.js.map(function(path) {
      return '    <script src="' + path + '"></script>';
    }).join('\n')));
  } else {
    res.send(html);
  }
});
app.get('/app', function(req, res) {
  res.redirect('/app/');
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
