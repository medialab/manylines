;(function() {
  'use strict';

  tbn.pkg('tbn.modules');

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
