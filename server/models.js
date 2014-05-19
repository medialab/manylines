var Model = require('../lib/model.js'),
    buckets = require('./buckets.js').buckets;

var schemas = {
  graph: {
    nodes: '?array',
    edges: '?array'
  },
  graphMeta: 'object',
  snapshot: {
    graph: 'object',
    view: 'object'
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
