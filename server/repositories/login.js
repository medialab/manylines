/**
 * TubeMyNet Login Repository
 * ===========================
 *
 */
var entities = require('../entities.js'),
    utils = require('../../lib/utils.js');

exports.authenticate = function(id, password, callback) {

  // Trying to get space with id
  entities.space.get(id, function(err, result) {
    if (err || !result)
      return callback(false);

    if (result.password !== utils.encrypt(password))
      return callback(false);

    callback(result);
  });
};
