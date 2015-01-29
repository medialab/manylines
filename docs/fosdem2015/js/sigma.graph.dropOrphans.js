;(function(undefined) {

  /**
   * Sigma Graph Drop Orphan Plugin
   * ===============================
   *
   * Drop unkinked nodes in the graph.
   *
   * Author: Guillaume Plique (Yomguithereal)
   * Version: 0.0.1
   */

  sigma.classes.graph.addMethod('dropOrphans', function() {
    this.nodes().forEach(function(node) {
      if (!this.allNeighborsCount[node.id])
        this.dropNode(node.id);
    }, this);
  });
}).call(this);
