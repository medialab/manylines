var express = require('express'),
    config = require('../config.json'),
    http = require('http'),
    path = require('path'),
    app = express(),
    controllers = {
      graphMeta: require('./controllers/graphMeta.js'),
      graph: require('./controllers/graph.js'),
      space: require('./controllers/space.js')
    },
    server;

/**
 * MIDDLEWARES:
 * ************
 */
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser(config.api.secret));
app.use(express.session({ domain: 'localhost:8080,localhost:8000' }));
app.use(express.bodyParser({ limit: '50mb' }));
app.use(app.router);

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * ROUTES:
 * *******
 */
app.get('/api/login/:id/:password', controllers.space.login);
app.get('/api/logout/:id', controllers.space.logout);

app.post('/api/space/:email/:password', controllers.space.create);
app.delete('/api/space/:id', controllers.space.delete);

app.post('/api/graph/last/:id', controllers.space.updateLast);
app.get('/api/graph/last/:id', controllers.space.readLast);

app.post('/api/graph/:id', function(req, res) { /* TODO */ });
app.get('/api/graph/:id', function(req, res) { /* TODO */ });

app.post('/api/graphmeta/:id/:password', function(req, res) { /* TODO */ });
app.get('/api/graphmeta/:id/:password', function(req, res) { /* TODO */ });

app.get('/*', express.static(__dirname + '/../' + config.static.path));

/**
 * EXPORT:
 * *******
 */
exports.app = app;
exports.start = function(port) {
  server = http.createServer(app).listen(port, function(){
    console.log('API server listening on port ' + port);
  });
};
exports.stop = function() {
  if (server)
    server.close();
};
