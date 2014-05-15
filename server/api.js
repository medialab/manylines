var express = require('express'),
    config = require('../config.json'),
    http = require('http'),
    path = require('path'),
    app = express(),
    log = require('../lib/log'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    env = process.env.NODE_ENV || 'development',
    controllers = {
      graphMeta: require('./controllers/graphMeta.js'),
      graph: require('./controllers/graph.js'),
      embed: require('./controllers/embed.js'),
      space: require('./controllers/space.js')
    },
    server;

/**
 * MIDDLEWARES:
 * ************
 */
app.use(log.api.middleware);
app.use(bodyParser({limit: '50mb'}));
app.use(cookieParser());
app.use(session({
  secret: config.api.secret,
  trustProxy: true,
  domain: 'localhost:8000,localhost:8080'
}));

// development only
if (env === 'development')
  app.use(errorHandler());

/**
 * API ROUTES:
 * ***********
 */
app.get('/api/login/:id/:password', controllers.space.login);
app.get('/api/logout/:id', controllers.space.logout);

app.post('/api/space', controllers.space.create);
app.post('/api/space/:id', controllers.space.update);
app.get('/api/space/:id', controllers.space.get);
app.delete('/api/space/:id', controllers.space.delete);

app.post('/api/space/graph/:id', controllers.space.addGraph);
app.get('/api/space/graph/:id/:version', controllers.space.readGraph);
app.post('/api/space/graph/:id/:version', controllers.space.updateGraph);

app.post('/api/space/export/:id/:version', controllers.space.exportGraph);
app.get('/api/space/export/:id/:version', controllers.space.getExports);
app.get('/api/space/export/:id', controllers.space.getExports);

app.get('/api/graph/:id', controllers.graph.get);
app.get('/api/graphmeta/:id', controllers.graphMeta.get);
app.get('/api/embed/:id', controllers.embed.get);

/**
 * STATIC FILES:
 * *************
 */
app.get('/*', express.static(__dirname + '/../' + config.static.path));

/**
 * EXPORT:
 * *******
 */
exports.app = app;
exports.start = function(port) {
  server = http.createServer(app).listen(port, function(){
    console.log('\x1b[92m[api]   \x1b[0m server listening on port ' +
                '\x1b[93m' + port + '\x1b[0m');
  });
};
exports.stop = function() {
  if (server)
    server.close();
};
