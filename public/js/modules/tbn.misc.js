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
   * The ad-hoc module to deal with views navigation.
   */
  tbn.modules.viewsPanel = function(d) {
    var self = this;
    tbn.dom.on('click', 'a[data-tbn-updateView]', function(e) {
      var target = $(e.target);

      if (!target.hasClass('todo'))
        self.dispatchEvent('updateView', {
          view: target.data('tbn-updateView')
        });

      e.stopPropagation();
      return false;
    });
  };




  /**
   * **************************
   * GENERIC DOM DOMINO MODULES
   * **************************
   */

  /**
   * A basic DOM module to dispatch an event when a DOM element is clicked. The
   * content of this event is specified in "obj".
   */
  tbn.modules.domClick = function(event, domElement) {
    var self = this;
    domElement.click(function() {
      self.dispatchEvent(event);
    });
  };

  /**
   * A basic DOM module that shows an element when a property is true and hide
   * it when it's falsy.
   */
  tbn.modules.domShow = function(property, domElement) {
    this.triggers.properties[property] = function(d) {
      if (d.get(property))
        domElement.show();
      else
        domElement.hide();
    };
  };

  /**
   * A basic DOM module that shows an element when a property is falsy and hide
   * it when it's truthy.
   */
  tbn.modules.domHide = function(property, domElement) {
    this.triggers.properties[property] = function(d) {
      if (d.get(property))
        domElement.hide();
      else
        domElement.show();
    };
  };
}).call(this);
