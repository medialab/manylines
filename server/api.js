/**
 * Manylines Api Server
 * =====================
 *
 * This server is meant to be called through a reverse proxy by the
 * static files.
 *
 * Its goal is to provide a RESTful interface to the couchbase database
 * storing the application graphs.
 *
 */
var express = require('express'),
    config = require('./config.js'),
    http = require('http'),
    path = require('path'),
    app = express(),
    chalk = require('chalk'),
    log = require('../lib/log.js').api,
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    env = process.env.NODE_ENV || 'development',
    Router = require('../lib/router.js'),
    policies = require('./policies.js'),
    controllers = {
      embed: require('./controllers/embed.js'),
      graph: require('./controllers/graph.js'),
      narrative: require('./controllers/narrative.js'),
      snapshot: require('./controllers/snapshot.js'),
      space: require('./controllers/space.js')
    },
    server;

/**
 * MIDDLEWARES:
 * ************
 */
app.use(log.middleware);
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
var router = new Router(app, {
  policies: policies,
  prefix: '/api',
  logger: log.logger
});

// Login routes
router.get('/login/:id/:password', controllers.space.login);
router.get('/logout/:id', controllers.space.logout);

// Space routes
router.post('/space', controllers.space.create);
router.post('/space/:id', controllers.space.update);
router.get('/space/:id/:version', controllers.space.get);
router.post('/space/:id/bump', controllers.space.bump);

// Graph sub space routes
router.get('/space/:id/graph/:version', controllers.graph.get);
router.post('/space/:id/graph/:version', controllers.graph.update);
router.post('/space/:id/meta/:version', controllers.graph.updateMeta);

// Snapshot sub space routes
router.get('/space/:id/snapshots/:version', controllers.snapshot.get);
router.post('/space/:id/snapshot/:version', controllers.snapshot.add);
router.delete('/space/:id/snapshot/:version/:snapshotId', controllers.snapshot.destroy);

// Narrative routes
router.post('/narrative/:id', controllers.narrative.update);
router.get('/space/:id/narratives/:version', controllers.narrative.getAll);
router.post('/space/:id/narrative/:version', controllers.narrative.create);
router.delete('/space/:id/narrative/:version/:narrativeId', controllers.narrative.destroy);

// Embed routes
router.get('/embed/narrative/:id', controllers.embed.narrative);

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
    log.logger.info('server listening on port ' + chalk.yellow('' + port));
  });
};
exports.stop = function() {
  if (server)
    server.close();
};
