;(function() {
  'use strict';

  tbn.pkg('tbn.modules');

  tbn.modules.layout = function(control) {
    // Initialize hash module:
    control.addModule(tbn.modules.location);

    // Initialize DOM modules:
    // TODO

    // Bind layout triggers:
    this.triggers.events.viewUpdate = function(d) {
      var view = d.get('view'),
          template = tbn.templates.require(view, function(template) {
            // TODO

            // Unlock UI:
            self.dispatchEvent('unlock');
          });

      // Lock UI until the template is loaded:
      self.dispatchEvent('lock');
    };
  };
}).call(this);
