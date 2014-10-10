/**
 * Manylines Winston Logger
 * =========================
 *
 * Logger abstraction to get feedback from both the API and static server.
 * Can be configured finely to write to shell or file and so on...
 */
var winston = require('winston'),
    util = require('util'),
    chalk = require('chalk'),
    onFinished = require('on-finished');

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
    return header + chalk[colors[lvl] || 'white'](lvl) + ' - ' + msg;
  }
};

// Custom transport
var Manylines = winston.transports.Manylines = function(options) {
  this.name = 'Manylines';
  this.prefix = options.prefix;
};

util.inherits(Manylines, winston.Transport);

Manylines.prototype.log = function(lvl, msg, meta, cb) {

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
    new winston.transports.Manylines({prefix: 'api'})
  ]
});

var staticLogger = new winston.Logger({
  level: 'debug',
  levels: levels,
  transports: [
    new winston.transports.Manylines({prefix: 'static'})
  ]
});

// Middlewares to catch express requests
function makeMiddleware(logger) {
  return function(req, res, next) {
    onFinished(res, function() {
      logger.request('', {
        req: req,
        res: res
      });
    });

    next();
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
