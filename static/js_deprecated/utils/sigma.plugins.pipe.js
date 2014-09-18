;(function(undefined) {

  /**
   * Sigma Piping Utility
   * =====================
   *
   * A handy sigma.js plugin giving access to a task system needed to pipe some
   * operations on a sigma's instance graph. The intention here is to be able
   * to run multiple operations on the graph without duplicating loops and
   * to design reusable graph alteration tasks.
   *
   * Author: Guillaume Plique (Yomguithereal)
   * Version: 0.0.1
   *
   */

  var _root = this;

  // Enforcing presence of sigma
  if (!('sigma' in _root))
    throw Error('sigma.pipe: sigma is not present on your context.');

  // Piping class
  function Piper(instance) {

    // Pipes
    this.pipes = [];
    this.iterator = null;

    // Methods
    this.src = function(model) {
      this.iterator = instance.graph[model];
      return this;
    };

    this.pipe = function(fn) {
      this.pipes.push(fn);
      return this;
    };

    this.exec = function() {
      var a = this.iterator(),
          i, l, j, k;

      for (i = 0, l = a.length; i < l; i++) {
        for (j = 0, k = this.pipes.length; j < k; j++) {
          this.pipes[j].call(instance, a[i]);
        }
      }
      return this;
    };

    this.refresh = function() {
      this.exec();
      instance.refresh();
      return this;
    };
  }

  // Extending prototype
  sigma.tasks = {};
  sigma.task = function(name, procedure) {
    if (typeof procedure !== 'function')
      throw Error('sigma.task: you did not provide a procedure.');

    // Adding the task
    sigma.tasks = sigma.tasks || {};
    sigma.tasks[name] = procedure;
  };

  sigma.prototype.run = function(name) {
    if (!(name in sigma.tasks))
      throw Error('sigma.run: inexistent task: "' + name + '".');

    // Applying given function
    sigma.tasks[name].call(this, new Piper(this));
  };
}).call(this);
