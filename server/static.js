var express = require('express'),
    config = require('../config.json'),
    httpProxy = require('http-proxy'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    app = express(),
    morgan = require('morgan'),
    log = require('../lib/log'),
    bodyParser = require('body-parser'),
    serveStatic = require('serve-static'),
    errorHandler = require('errorhandler'),
    env = process.env.NODE_ENV || 'development',
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
app.use(morgan({format: log.formats.static}));
app.use(bodyParser());
app.use(serveStatic(path.join(__dirname, 'app')));

// development only
if (env === 'development')
  app.use(errorHandler());

/**
 * ROUTES:
 * *******
 */
app.get('/app/', function(req, res) {
  var html = fs.readFileSync(__dirname + '/../' + config.static.path + '/app.html', 'utf8');

  if (env === 'development') {
    var json = JSON.parse(fs.readFileSync(__dirname + '/../imports.json', 'utf8'));

    res.send(html.replace(/^[^<]*<link href=".*\/app\.min\.css" rel="stylesheet">/mg, json.app.css.map(function(path) {
      return '    <link href="' + path + '" rel="stylesheet">';
    }).join('\n')).replace(/^[^<]*<script src=".*\/app\.min\.js"><\/script>/mg, json.app.js.map(function(path) {
      return '    <script src="' + path + '"></script>';
    }).join('\n')));
  } else {
    res.send(html);
  }
});
app.get('/embed/', function(req, res) {
  var html = fs.readFileSync(__dirname + '/../' + config.static.path + '/embed.html', 'utf8');

  if (env === 'development') {
    var json = JSON.parse(fs.readFileSync(__dirname + '/../imports.json', 'utf8'));

    res.send(html.replace(/^[^<]*<link href=".*\/embed\.min\.css" rel="stylesheet">/mg, json.embed.css.map(function(path) {
      return '    <link href="' + path + '" rel="stylesheet">';
    }).join('\n')).replace(/^[^<]*<script src=".*\/embed\.min\.js"><\/script>/mg, json.embed.js.map(function(path) {
      return '    <script src="' + path + '"></script>';
    }).join('\n')));
  } else {
    res.send(html);
  }
});
app.get('/app', function(req, res) {
  res.redirect('/app/');
});
app.get('/embed', function(req, res) {
  res.redirect('/embed/');
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
    console.log('\x1b[94m[static]\x1b[0m server listening on port ' +
                '\x1b[93m' + port + '\x1b[0m\n');
  });
};
exports.stop = function() {
  if (server)
    server.close();
};
