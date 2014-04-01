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
        d.log('Update hash:', hash);
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
   * The form to create a space.
   */
  tbn.modules.spaceForm = function(d) {
    var modal,
        self = this;

    this.triggers.events.spaceIdUpdated = function(d) {
      modal.add($('body > .modal-backdrop')).remove();
    };

    this.triggers.events.openSpaceForm = function(d) {
      // Lock UI until the template is loaded:
      self.dispatchEvent('lock');

      tbn.templates.require('tbn.spaceForm', function(template) {
        self.dispatchEvent('unlock');
        if (modal)
          modal.add($('body > .modal-backdrop')).remove();

        // Initialize new modal:
        modal = $(template()).i18n().modal();

        // Bind event listeners:
        $('button.close', modal).click(function() {
          modal.add($('body > .modal-backdrop')).remove();
        });
        $('#space-save', modal).click(function() {
          self.dispatchEvent('createSpace', {
            email: $('#space-email', modal).val(),
            password: $('#space-password', modal).val()
          });
        });
      });
    };
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
    domElement.click(function(e) {
      self.dispatchEvent(event);
      e.stopPropagation();
      return false;
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
