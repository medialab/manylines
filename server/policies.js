/**
 * TubeMyNet Policies Middlewares
 * ===============================
 *
 * Here should be archived every middlewares used by TubeMyNet's API.
 */

// Authentication policy
exports.authenticated = function(req, res, next) {
  if (!req.session.authenticated)
    return res.send(401);
  else
    next();
};
