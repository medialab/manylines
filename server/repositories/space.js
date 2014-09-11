/**
 * TubeMyNet Space Repository
 * ===========================
 *
 */
var async = require('async'),
    models = require('../models'),
    utils = require('../../lib/utils.js');

exports.initialize = function(email, password, graphData, graphMetas, callback) {

  // Creating the needed items
  async.waterfall([
    function graph(next) {
      models.graph.create(graphData, next);
    },
    function space(graph, next) {
      var data = {
        email: email,
        password: utils.encrypt(password),
        graphs: [
          {
            id: graph.id,
            metas: graphMetas
          }
        ]
      };

      models.space.create(data, next);
    }
  ], callback);
};

exports.update = function(id, email, password, callback) {
  var updateData = {};

  email && (updateData.email = email);
  password && (updateData.password = password);

  models.space.update(id, updateData, callback);
};
