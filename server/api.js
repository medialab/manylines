var express = require('express'),
    config = require('../config.json'),
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
app.configure(function() {
  // Cross origin policy:
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return next();
  });

  // Sessions:
  app.use(express.cookieParser(config.api.secret));
  app.use(express.session());
  app.use(app.router);
});

/**
 * ROUTES:
 * *******
 */
app.get('/login/:space/:password', controllers.space.login);
app.get('/logout/:space', controllers.space.logout);

app.post('/space/:email/:password', controllers.space.create);
app.delete('/space/:id/:password', controllers.space.delete);

app.get('/graph/:id/:pwd', function(req, res) {
  // TODO
});
app.get('/graph/:id', function(req, res) {
  // TODO
});
app.post('/graph/:id/:pwd', function(req, res) {
  // TODO
});

app.get('/graphmeta/:id/:pwd', function(req, res) {
  // TODO
});
app.post('/graphmeta/:id/:pwd', function(req, res) {
  // TODO
});




/**
 * EXPORT:
 * *******
 */
exports.app = app;
exports.start = function(port) {
  server = app.listen(port);
};
exports.stop = function() {
  if (server)
    server.close();
};
