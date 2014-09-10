/**
 * TubeMyNet Api Server
 * =====================
 *
 * This server is meant to be called through a reverse proxy by the
 * static server.
 *
 * Its goal is to provide a RESTful interface to the couchbase database
 * storing the application saved graphs.
 *
 */
var express = require('express'),
    config = require('./config.js'),
    http = require('http'),
    path = require('path'),
    app = express(),
    chalk = require('chalk'),
    log = require('../lib/log'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    env = process.env.NODE_ENV || 'development',
    controllers = {
      snapshot: require('./controllers/snapshot.js'),
      graphMeta: require('./controllers/graphMeta.js'),
      graph: require('./controllers/graph.js'),
      space: require('./controllers/space.js'),
      narrative: require('./controllers/narrative.js')
    },
    server;

/**
 * MIDDLEWARES:
 * ************
 */
app.use(log.api.middleware);
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(cookieParser());
app.use(session({
  secret: config.api.secret,
  trustProxy: true,
  domain: 'localhost:' + config.api.port + ',localhost:' + config.static.port,
  resave: true,
  saveUninitialized: true
}));

// development only
if (env === 'development')
  app.use(errorHandler());

/**
 * API ROUTES:
 * ***********
 */

// Login routes
app.get('/api/login/:id/:password', controllers.space.login);
app.get('/api/logout/:id', controllers.space.logout);

// Space routes
app.post('/api/space', controllers.space.create);
app.post('/api/space/:id', controllers.space.update);
app.get('/api/space/:id', controllers.space.get);
app.delete('/api/space/:id', controllers.space.delete);

// Space relvant graph routes
app.post('/api/space/graph/:id', controllers.space.addGraph);
app.get('/api/space/graph/:id/:version', controllers.space.readGraph);
app.post('/api/space/graph/:id/:version', controllers.space.updateGraph);

// Snapshots routes
app.post('/api/space/snapshot/:id/:version', controllers.space.addSnapshot);
app.get('/api/space/snapshot/:id/:version', controllers.space.getSnapshot);
app.get('/api/space/snapshot/:id', controllers.space.getSnapshot);

// Misc get routes
app.get('/api/graph/:id', controllers.graph.get);
app.get('/api/graphmeta/:id', controllers.graphMeta.get);
app.get('/api/snapshot/:id', controllers.snapshot.get);

// Narrative routes
app.post('/api/narrative/:id/:version', controllers.narrative.add);

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
    log.api.logger.info('server listening on port ' + chalk.yellow('' + port));
  });
};
exports.stop = function() {
  if (server)
    server.close();
};
