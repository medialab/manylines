;(function(undefined) {

  /**
   * Manylines Modals Module
   * ========================
   *
   * A simple module dealing with bootstrap modals.
   */

  app.modules.modals = function() {
    var self = this;

    // Modals
    var modals = {
      bump: {
        emitters: function(modal) {

          /**
           * Closing the modal
           */
          $('#space-bump-cancel', modal).click(function() {
            modal.modal('hide');
          });

          /**
           * Bumping the graph
           */
          $('#space-bump-confirm', modal).click(function() {
            self.dispatchEvent('bump');
            modal.modal('hide');
          });
        }
      },
      save: {
        emitters: function(modal) {

          /**
           * Submit on enter key.
           */
          $('input', modal).keypress(function(e) {
            if (e.which === 13)
              $('#space-save', modal).trigger('click');
          });

          /**
           * Submitting the form.
           */
          $('#space-save', modal).click(function() {
            var email = $('#space-email', modal).val(),
                password = $('#space-password', modal).val();

            if (email && password) {
              self.dispatchEvent('save', {
                create: true,
                email: email,
                password: password
              });

              // Closing
              modal.modal('hide');
            }
            else if (!email) {
              self.dispatchEvent('warning', {reason: 'warnings.missing_email'});
            }
            else if (!password) {
              self.dispatchEvent('warning', {reason: 'warnings.missing_password'});
            }
          });
        }
      },
      share: {
        renderData: function(params) {
          return {
            url: location.protocol + '//' + location.host + '/embed#/narrative/' +
                 app.control.query('narrativeById', app.control.expand('currentNarrative')).id
          };
        },
        emitters: function(modal) {

          /**
           * Selecting the iframe text.
           */
          $('#iframe-code', modal).select();
        }
      }
    };

    // Methods
    this.openModal = function(name) {

      // Retrieving modal if existant
      var $modal = $('[data-app-modal="' + name + '"]');

      if ($modal.length && !modals[name].renderData) {
        modals[name].emitters && (modals[name].emitters($modal))
        return $modal.modal('show');
      }

      // Requesting template
      app.templates.require('modals.' + name, function(template) {
        var modal = $(template((modals[name].renderData && modals[name].renderData()) || {})).i18n().modal();
        modals[name].emitters && (modals[name].emitters(modal));
      });
    };

    // Receptors
    this.triggers.events['modal'] = function(d, e) {
      if (e.data.type in modals)
        self.openModal(e.data.type);
    };
  };
}).call(this);
