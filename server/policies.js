/**
 * Manylines Policies Middlewares
 * ===============================
 *
 * Here should be archived every middlewares used by Manylines's API.
 */

// Authentication policy
exports.authenticated = function(req, res, next) {
  var id = req.param('id');

  if (!(req.session.spaces || {}[id]))
    return res.status(401).send('Unauthorized').end();
  else
    next();
};
