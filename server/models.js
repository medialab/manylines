var Model = require('../lib/model.js'),
    buckets = require('./buckets.js').buckets;

var schemas = {
  graph: {
    nodes: '?array',
    edges: '?array'
  },
  graphMeta: 'object',
  snapshot: {
    graph: '?object', // The graph is not copied for the time being
    view: 'object', // An object containing the camera and further data if needed
    filters: 'array'
  },
  space: {
    password: 'string',
    email: 'string',
    graphs: '?array'
  }
};

for (var i in buckets) {
  exports[i] = new Model(i, buckets[i], schemas[i]);
}
