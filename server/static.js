/**
 * Manylines Model Abstraction
 * ============================
 *
 * This static server is meant to serve the front-end of the application and to
 * provide a reverse-proxy hitting Manylines's API.
 *
 * Even if the development version uses Express to achieve this goal one could
 * obviously use any kind of server to do this: Apache, nginx etc.
 *
 */
var express = require('express'),
    config = require('./config.js'),
    chalk = require('chalk'),
    httpProxy = require('http-proxy'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    app = express(),
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
proxy = httpProxy.createServer({ target: 'http://localhost:' + config.api.port });
app.use(function(req, res, next) {
  if (req.url.match(/\/api\/.*/))
    return proxy.proxyRequest(req, res, { host: 'http://localhost' }, { port: '' + config.api.port });
  else
    return next();
});
app.use(log.static.middleware);
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
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
      return '    <link href="/manylines' + path + '" rel="stylesheet">';
    }).join('\n')).replace(/^[^<]*<script src=".*\/app\.min\.js"><\/script>/mg, json.app.js.map(function(path) {
      return '    <script src="/manylines' + path + '"></script>';
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
      return '    <link href="/manylines' + path + '" rel="stylesheet">';
    }).join('\n')).replace(/^[^<]*<script src=".*\/embed\.min\.js"><\/script>/mg, json.embed.js.map(function(path) {
      return '    <script src="/manylines' + path + '"></script>';
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
    log.static.logger.info('server listening on port ' +
                           chalk.yellow('' + port) + '\n');
  });
};
exports.stop = function() {
  if (server)
    server.close();
};
