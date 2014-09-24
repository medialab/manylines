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

    var s = app.control.get('mainSigma');

    // Privates
    function bindSigmaActions() {

      // Zoom
      $('*[data-app-sigma-action="zoom"]', self.dom).click(function() {
        var cam = s.cameras.main;

        sigma.misc.animation.camera(
          cam,
          { ratio: cam.ratio / 1.5 },
          { duration: 150 }
        );
      });

      // Unzoom
      $('*[data-app-sigma-action="unzoom"]', self.dom).click(function() {
        var cam = s.cameras.main;

        sigma.misc.animation.camera(
          cam,
          { ratio: cam.ratio * 1.5 },
          { duration: 150 }
        );
      });

      // Recenter
      $('*[data-app-sigma-action="recenter"]', self.dom).click(function() {
        var cam = s.cameras.main;

        sigma.misc.animation.camera(
          cam,
          { x: 0,
            y: 0,
            angle: 0,
            ratio: 1 },
          { duration: 150 }
        );
      });
    }

    // Methods
    this.render = function() {
      app.templates.require(params.name, function(template) {
        self.mainTemplate = template;

        // Rendering
        $beforeMain.next('div').replaceWith(template());
        self.dom = $beforeMain.next('div');

        // Rendering graph if necessary
        if (params.graph) {
          $('.sigma-expand').replaceWith(app.control.get('mainRendererContainer'));

          // Binding actions
          bindSigmaActions();

          // Resizing the renderer
          s.renderers.main.resize();

          // Recentering camera
          s.cameras.main.goTo({x: 0, y: 0, ratio: 1, angle: 0});

          // Refreshing sigma and resetting colors
          s.run('resetColors');
        }

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

    this.mount = function() {

      // Rendering
      this.render();
    };

    this.unmount = function() {

      if (params.graph) {

        // Unmounting graph renderer
        $('.sigma-panel')[0].removeChild(app.control.get('mainRendererContainer'));
      }

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
