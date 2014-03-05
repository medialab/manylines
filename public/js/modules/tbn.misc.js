;(function() {
  'use strict';

  tbn.pkg('tbn.modules');

  /**
   * The module that sets with the URL.
   */
  tbn.modules.location = function() {
    var stored,
        self = this;

    if ('onhashchange' in window)
      window.onhashchange = function() {
        hashChanged(window.location.hash);
      };
    else {
      stored = window.location.hash;
      window.setInterval(function() {
        if (window.location.hash !== stored) {
          stored = window.location.hash;
          hashChanged(stored);
        }
      }, 100);
    }

    function hashChanged() {
      self.dispatchEvent('hashUpdated', {
        hash: window.location.hash
      });
    }

    this.triggers.events.updateHash = function(d, e) {
      var hash = e.data.hash;

      if (stored !== hash) {
        stored = hash;
        window.location.hash = hash;
      }
    }
  };

  /**
   * A basic DOM module to display the value of a property when this one is
   * updated.
   */
  tbn.modules.domText = function(property, domElement) {
    this.properties[property] = function(d) {
      domElement.text(d.get(property));
    };
  };

  /**
   * A basic DOM module to set the attribute of a DOM element as the value of a
   * property when this one is updated.
   */
  tbn.modules.domAttribute = function(property, attribute, domElement) {
    this.properties[property] = function(d) {
      domElement.text(d.get(property));
    };
  };

  /**
   * A basic DOM module to dispatch an event when a DOM element is clicked. The
   * content of this event is specified in "obj".
   */
  tbn.modules.domClick = function(event, domElement, obj) {
    var self = this;
    domElement.click(function() {
      self.dispatchEvent(event, obj);
    });
  };

  /**
   * A basic DOM module to dispatch an event when a DOM element is clicked. The
   * content of this event is specified in "obj".
   */
  tbn.modules.domShow = function(event, domElement, obj) {
    var self = this;
    domElement.click(function() {
      self.dispatchEvent(event, obj);
    });
  };
}).call(this);
