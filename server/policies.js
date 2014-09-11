/**
 * TubeMyNet Policies Middlewares
 * ===============================
 *
 * Here should be archived every middlewares used by TubeMyNet's API.
 */

// Authentication policy
exports.authenticated = function(req, res, next) {
  if (!(req.session.spaces || []).length)
    return res.status(401).send('Unauthorized').end();
  else
    next();
};
