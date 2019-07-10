;(function(undefined) {

  /**
   * Manylines Login Pane
   * =====================
   *
   * Simply displaying the login form.
   */

  app.panes.login = function() {
    var self = this;

    // Extending
    Pane.call(this, {name: 'login'});


    // Emitters
    this.emitters = function(dom) {

      /**
       * Focusing on the input.
       */
      $('#login-password', dom).focus();

      /**
       * Submitting password.
       */
      $('#login-signin').click(function(e) {
        var password = $('#login-password').val().trim();

        if (!password)
          return;

        self.dispatchEvent('login.attempt', password);

        // TODO: blocking bootstrap methods. Clean this up.
        e.stopPropagation();
        return false;
      });

      /**
       * On keypress.
       */
      $('input', dom).keypress(function(e) {
        if (e.which === 13) {
          $('#login-signin').trigger('click');
          $('#login-signin').blur();
          e.preventDefault();
        }
      });
    };
  };
}).call(this);
