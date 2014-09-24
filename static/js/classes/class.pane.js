;(function(undefined) {

  /**
   * TubeMyNet Pane Class
   * ======================
   *
   * Pane abstraction providing helpers for cleaner code.
   */

  this.Pane = function(params) {
    var self = this,
        $beforeMain = $('.before-main');

    // Properties
    this.mainTemplate = null;
    this.childModules = [];
    this.rendered = false;

    // Methods
    this.render = function() {
      app.templates.require(params.name, function(template) {
        self.mainTemplate = template;

        // Rendering
        $beforeMain.next('div').replaceWith(template());
        self.dom = $beforeMain.next('div');

        // Rendering graph if necessary
        if (params.graph)
          self.addChildModule(app.modules.graph, [self.dom]);

        // Registering emitters
        self.emitters && (self.emitters(self.dom));

        // Hook
        self.rendered = true;
        self.didRender && (self.didRender())
      });
    };

    this.addChildModule = function(module, args) {
      this.childModules.push(app.control.addModule(module, (args ||  []).concat(this)));
      return this.childModules[this.childModules.length - 1];
    };

    this.removeChildModule = function(module) {
      var index = this.childModules.indexOf(module);
      module.unmount && (module.unmount())
      this.childModules.splice(index, 1);
    };

    this.mount = function() {

      // Rendering
      this.render();
    };

    this.unmount = function() {

      // Killing childs
      this.childModules.forEach(function(module) {
        module.unmount && (module.unmount())
        app.control.killModule(module);
      });

      // Hook
      this.willUnmount && (this.willUnmount())
    };
  };
}).call(this);
