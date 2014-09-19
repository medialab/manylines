;(function(undefined) {

  /**
   * TubeMyNet Modals Module
   * ========================
   *
   * A simple module dealing with bootstrap modals.
   */

  app.modules.modals = function() {
    var self = this;

    // Modals
    var modals = {
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
      }
    };

    // Methods
    this.openModal = function(name) {

      // Requesting template
      app.templates.require('modals.' + name, function(template) {
        var modal = $(template()).i18n().modal();
        modals[name].emitters(modal);
      });
    };

    // Receptors
    this.triggers.events['modal'] = function(d, e) {
      if (e.data.type in modals)
        self.openModal(e.data.type);
    };
  };
}).call(this);
