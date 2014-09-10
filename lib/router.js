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
var struct = require('./struct.js');

// Main class
function Router(app, config) {

  // Defaults
  config = config || {};
  config.policies = config.policies || {};

  // Methods
  this.addRoute = function(verb, url, params) {

    // Polymorphism
    var action = typeof params === 'function' ? {method: params} : params;

    var middlewares = [];

    // Binding validation middleware
    if (action.validate)
      middlewares.push(function validate(req, res, next) {

        // Retrieving schema and data
        var schema = {},
            data = {},
            k;

        for (k in action.validate) {
          schema[k] = action.validate[k];
          data[k] = req.param(k);
        }

        // Is data retrieved valid?
        if (!struct.check(schema, data))
          return res.send(400);
        else
          next();
      });

    // Binding policies
    if (action.policies) {
      var policies = actions.policies instanceof Array ?
        action.policies :
        [action.policies];

      policies.forEach(function(policy) {
        middlewares.push(
          typeof policy === 'function' ? policy : config.policies[policy]);
      });
    }

    // Binding route action
    middlewares.push(action.method);

    // Adding route to application
    app[verb].apply(app, [url].concat(middlewares));
  };
}

// Exporting
module.exports = Router;
