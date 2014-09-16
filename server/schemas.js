/**
 * TubeMyNet Model Schemas
 * ========================
 *
 * Structural data schemas for every TubeMyNet's models.
 */
var types = require('typology');

// Definitions
var schemas = {

  // A graph filter
  filter: {
    category: 'string',
    values: 'array'
  },

  // A narrative slide
  slide: {
    title: 'string',
    text: 'string',
    snapshot: 'string'
  },

  // Graph data itself
  graph: {
    nodes: 'array',
    edges: 'array'
  },

  // A succession of snapshots organized as slides
  narrative: {
    title: 'string',
    slides: ['slide'],
    space: 'string',
    version: 'number'
  },

  // A graph's metadata definition
  meta: '?object',

  // A precise view of a graph
  snapshot: {
    id: '?string',
    view: {
      camera: {
        x: 'number',
        y: 'number',
        ratio: 'number',
        angle: '?number'
      }
    },
    filters: ['?filter']
  },

  // A given user's workspace
  space: {
    password: 'string',
    email: 'string',
    graphs: '?array'
  }
};

// Adding to structures
for (var k in schemas)
  types.add(k, schemas[k]);

module.exports = schemas;
