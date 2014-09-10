/**
 * TubeMyNet Model Registration
 * =============================
 *
 * Instantiating any model needed by the API server to run.
 */
var Model = require('../lib/model.js'),
    buckets = require('./buckets.js').buckets;

var schemas = {

  // Graph data itself
  graph: {
    nodes: '?array',
    edges: '?array'
  },

  // Metadata concerning the given graph
  graphMeta: 'object',

  // A succession of snapshots organized as slides
  narrative: {
    title: 'string',
    slides: 'array'
  },

  // A filtered view of the given graph
  snapshot: {
    graph: '?object',
    view: 'object',
    filters: 'array'
  },

  // A given user's workspace
  space: {
    password: 'string',
    email: 'string',
    graphs: '?array'
  }
};

for (var i in buckets)
  exports[i] = new Model(i, buckets[i], schemas[i]);
