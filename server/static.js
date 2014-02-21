var express = require('express'),
    config = require('../config.json'),
    httpProxy = require('http-proxy'),
    http = require('http'),
    path = require('path'),
    app = express(),
    server,
    proxy;

/**
 * MIDDLEWARES:
 * ************
 */
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
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
app.get('/*', express.static(__dirname + '/../' + config.static.path));

proxy = httpProxy.createServer({ target: 'http://localhost:8080' });
app.all('/api/*', function(req, res) {
  proxy.proxyRequest(req, res);
});




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
