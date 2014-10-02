;(function(undefined) {

  /**
   * TubeMyNet Graph Tasks
   * ======================
   *
   * Unitary functions and tasks to be run on the application's main graph.
   */

  var base = ('app' in this ? app : embed);

  /**
   * Unitary functions
   * ------------------
   */

  /**
   * Cache a property into the "original" object for later use.
   */
  function cache(property) {
    return function(element) {
      element.original = element.original || {};

      if (!element.original[property])
        element.original[property] = element[property] || null;
    };
  }

  /**
   * Reset a property.
   */
  function reset(property) {
    return function(element) {
      element[property] = (element.original || {})[property] || element[property];
      if (element.original && element.original[property])
        delete element.original[property];

      if (element.original && element.original[property] === null)
        delete element[property];
    };
  }

  /**
   * Clean an element of potential temporary values attached to it.
   */
  function clean(element) {
    delete element.hidden;
    delete element.muted;
  }

  /**
   * Apply a size to node relative to their degree.
   */
  function degreeSize(option) {
    return function(node) {
      if (option === 'original')
        node.size = node.original.size;
      else if (option === 'degree')
        node.size = 1 + 2 * Math.sqrt(this.graph.degree(node.id));
      else if (option === 'indegree')
        node.size = 1 + 2 * Math.sqrt(this.graph.degree(node.id, 'in'));
      else
        node.size = 1 + 2 * Math.sqrt(this.graph.degree(node.id, 'out'));
    };
  }

  /**
   * Apply a color to a node, relative to a category.
   */
  function categoryColor(category, colors) {
    return function(node) {
      node.color = colors ?
        colors[node.attributes[category.id]] :
        node.original.id;
    };
  }

  /**
   * Highlight a node if it is of a certain category's value and mute it otherwise.
   */
  function highlightNode(category, values, colors) {
    return function(node) {
      var muted = !values.some(function(v) {
        return node.attributes[category.id] === v;
      });

      var color = colors[node.attributes[category.id]];

      node.color = muted ? base.utils.muteColor(color) : color;

      node.muted = muted;
    };
  }

  /**
   * Mute an edge either if its source or target is muted.
   */
  function muteEdge(edge) {
    var n = this.graph.nodes;

    if (n(edge.source).muted || n(edge.target).muted)
      edge.hidden = true;
    else
      delete edge.hidden;
  }


  /**
   * Macro-tasks
   * ------------
   */

  /**
   * Cache the nodes' sizes and change it to a factor of their degree.
   */
  sigma.task('mapSizes', function(graph, option) {
    return graph.src('nodes')
      .pipe(cache('size'))
      .pipe(degreeSize(option))
      .refresh();
  });

  /**
   * Cache the nodes' color and apply categories colors on it.
   */
  sigma.task('mapColors', function(graph, category) {
    if (!category)
      return this.run('resetColors');

    var colors = category ?
      base.utils.indexBy(category.values, function(v) {
        return [v.id, v.color];
      }) :
      null;

    graph.src('edges')
      .pipe(clean)
      .exec();

    return graph.src('nodes')
      .pipe(cache('color'))
      .pipe(clean)
      .pipe(categoryColor(category, colors))
      .refresh();
  });

  /**
   * Reset the nodes' colors.
   */
  sigma.task('resetColors', function(graph) {
    graph.src('edges')
      .pipe(clean)
      .exec();

    return graph.src('nodes')
      .pipe(reset('color'))
      .refresh();
  });

  /**
   * Highlight a precise set of values for a given category.
   */
  sigma.task('highlightCategoryValues', function(graph, category, values) {
    if (!category)
      return this.run('resetColors');
    if (!(values || []).length)
      return this.run('mapColors', category);

    var colors = base.utils.indexBy(category.values, function(v) {
      return [v.id, v.color];
    });

    // Altering nodes
    graph.src('nodes')
      .pipe(cache('color'))
      .pipe(highlightNode(category, values, colors))
      .exec();

    // Then altering edges and refreshing
    graph.src('edges')
      .pipe(muteEdge)
      .refresh();
  });

  /**
   * Graph Data retrieval
   * ---------------------
   */

  function dropOverload(n) {
    var o = {},
        k;

    for (k in n) {
      if (!~k.indexOf(':') &&
          !~k.indexOf('true') &&
          k !== 'muted' &&
          k !== 'hidden' &&
          !(n.original && n.original[k] === null)) {
        o[k] = (n.original && n.original[k]) || n[k];
      }
    }

    return o;
  }

  sigma.prototype.retrieveGraphData = function() {
    return {
      nodes: this.graph.nodes().map(dropOverload),
      edges: this.graph.edges().map(dropOverload)
    };
  };
}).call(this);
