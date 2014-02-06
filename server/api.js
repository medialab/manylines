var express = require('express'),
    app = express(),
    controllers = {
      graphMeta: require('./controllers/graphMeta.js'),
      graph: require('./controllers/graph.js'),
      space: require('./controllers/space.js')
    },
    server;

/**
 * SPACE ROUTES:
 * *************
 */
app.put('/space/:email/:password', function(req, res) {
  controllers.space.create({
    password: req.params.password,
    email: req.params.email
  }, function(err, result) {
    res.send(JSON.stringify(result));
  });
});
app.delete('/space/:id/:pwd', function(req, res) {
  controllers.space.delete(req.params.id, function(err, result) {
    res.send(JSON.stringify(result));
  });
});

/**
 * GRAPH ROUTES:
 * *************
 */
app.get('/graph/:id/:pwd', function(req, res) {
  // TODO
});
app.post('/graph/:id/:pwd', function(req, res) {
  // TODO
});

/**
 * GRAPH-META ROUTES:
 * ******************
 */
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
  server = app.listen(
    arguments.length ?
      port :
      8000
  );
};
exports.stop = function() {
  if (server)
    server.close();
};
