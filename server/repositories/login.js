/**
 * TubeMyNet Login Repository
 * ===========================
 *
 */
var models = require('../models'),
    utils = require('../../lib/utils.js');

exports.authenticate = function(id, password, callback) {

  // Trying to get space with id
  models.space.get(id, function(err, result) {
    if (err || !result)
      return callback(false);

    if (result.password !== utils.encrypt(password))
      return callback(false);

    callback(result);
  });
};
