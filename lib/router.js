/**
 * TubeMyNet Router Abstraction
 * =============================
 *
 * The Router goal is just to expand Express base route definition to enable
 * for middleware piping.
 *
 * This is needed to create policies and other checking that should occur
 * before the execution of the relevant controller action.
 */
var struct = require('./struct.js'),
    utils = require('./utils.js');

// Main class
function Router(app, config) {
  var self = this;

  // Defaults
  var options = utils.extend(config, {policies: {}, prefix: ''}),
      logger = config.logger;

  // Methods
  this.addRoute = function(verb, url, params) {

    // Polymorphism
    var action = typeof params === 'function' ? {method: params} : params;
    action = utils.extend(action, {policies: []});

    var middlewares = [];

    // Binding utilities middleware
    middlewares.push(function utilities(req, res, next) {

      // Error handling
      res.error = function(message, code) {
        logger.error(req.path + ': ' + message);
        return res.status(code || 500).send(message).end();
      };

      next();
    });

    // Binding validation middleware
    if (action.validate)
      middlewares.push(function validate(req, res, next) {

        // Retrieving schema and data
        var data = {},
            k;

        for (k in action.validate)
          data[k] = req.param(k);

        // Is data retrieved valid?
        if (!struct.check(action.validate, data))
          return res.status(400).send('Bad Request').end();
        else
          next();
      });

    // Binding policies
    var policies = action.policies instanceof Array ?
      action.policies :
      [action.policies];

    policies.forEach(function(policy) {
      middlewares.push(
        typeof policy === 'function' ? policy : options.policies[policy]);
    });

    // Binding route action
    middlewares.push(action.method);

    // Adding route to application
    app[verb].apply(app, [options.prefix + url].concat(middlewares));
  };

  // Creating shortcuts for popular verbs
  ['get', 'post', 'delete'].forEach(function(verb) {
    self[verb] = function(url, params) {
      self.addRoute(verb, url, params);
    };
  });
}

// Exporting
module.exports = Router;
