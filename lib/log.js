/**
 * TubeMyNet Winston Logger
 * =========================
 *
 */
var winston = require('winston'),
    util = require('util'),
    chalk = require('chalk');

// Custom levels
var levels = {
  debug: 0,
  verbose: 1,
  request: 2,
  info: 3,
  warning: 4,
  error: 5,
  critical: 6
};

var colors = {
  debug: 'blue',
  verbose: 'cyan',
  info: 'green',
  warning: 'orange',
  error: 'red',
  critical: 'magenta'
};

// Custom formatters
function format(prefix, lvl, msg, meta) {
  var header = chalk[(prefix === 'api') ? 'green' : 'blue'].inverse(prefix) +
               (prefix === 'api' ? '    ' : ' ');

  if (lvl === 'request') {
    var status = meta.res.statusCode,
        color = 'green';

    // Determining color
    if (status >= 500)
      color = 'red';
    else if (status >= 400)
      color = 'yellow';
    else if (status >= 300)
      color = 'cyan';

    return header + chalk.grey(meta.req.method + '  ' +
           (meta.req.originalUrl || meta.req.url) + ' ') +
           ' ' + chalk[color]('' + status);
  }
  else {
    var errorMsg = (meta.errorMsg) ?
      '\n              -> Message: ' + meta.errorMsg :
      '';

    return header +
           chalk[colors[lvl] || 'white'](lvl) +
           ' - ' + msg +
           errorMsg;
  }
};

// Custom transport
var TubeMyNet = winston.transports.TubeMyNet = function(options) {
  this.name = 'TubeMyNet';
  this.prefix = options.prefix;
};

util.inherits(TubeMyNet, winston.Transport);

TubeMyNet.prototype.log = function(lvl, msg, meta, cb) {

  // Logging happens here...
  console.log(format(this.prefix, lvl, msg, meta));

  // Callback
  cb(null, true);
};

// Logger instances
var apiLogger = new winston.Logger({
  level: 'debug',
  levels: levels,
  transports: [
    new winston.transports.TubeMyNet({prefix: 'api'})
  ]
});

var staticLogger = new winston.Logger({
  level: 'debug',
  levels: levels,
  transports: [
    new winston.transports.TubeMyNet({prefix: 'static'})
  ]
});

// Middlewares to catch express requests
function makeMiddleware(logger) {
  return function(req, res, next) {
    logger.request('', {
      req: req,
      res: res
    });
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
