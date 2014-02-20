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
  app.use(express.cookieParser());
  app.use(express.session({
    secret: config.api.secret,
    store: express.session.MemoryStore({ reapInterval: 60000 * 10 })
    // cookie: {
    //   path: '/',
    //   httpOnly: true,
    //   secure: true,
    //   expires: false
    // }
  }));
});

/**
 * ROUTES:
 * *******
 */
app.get('/login/:id/:password', controllers.space.login);
app.get('/logout/:id', controllers.space.logout);

app.post('/space/:email/:password', controllers.space.create);
app.delete('/space/:id', controllers.space.delete);

app.post('/graph/:id/:password', function(req, res) { /* TODO */ });
app.get('/graph/:id/:password', function(req, res) { /* TODO */ });
app.get('/graph/:id', function(req, res) { /* TODO */ });

app.post('/graphmeta/:id/:password', function(req, res) { /* TODO */ });
app.get('/graphmeta/:id/:password', function(req, res) { /* TODO */ });




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
