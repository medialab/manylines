/**
 * TubeMyNet Winston Logger
 * =========================
 *
 */
var winston = require('winston'),
    util = require('util');

// Custom transport
var TubeMyNet = winston.transports.TubeMyNet = function(options) {
  this.name = 'TubeMyNet';
};

util.inherits(TubeMyNet, winston.Transport);

TubeMyNet.prototype.log = function(lvl, msg, meta, cb) {

  // Logging happens here...
  console.log(msg);

  // Callback
  cb(null, true);
};

// Logger instances
var apiLogger = new winston.Logger({
  transports: [
    new winston.transports.TubeMyNet('api')
  ]
});

var staticLogger = new winston.Logger({
  transports: [
    new winston.transports.TubeMyNet('static')
  ]
});

// Middlewares to catch express requests
function makeMiddleware(logger) {
  return function(req, res, next) {
    logger.log('info', req.method);
    return next();
  }
}

module.exports = {
  api: {
    middleware: makeMiddleware(apiLogger),
    logger: apiLogger
  },
  static: {
    middleware: makeMiddleware(staticLogger),
    logger: staticLogger
  }
};
