;(function(undefined) {

  /**
   * TubeMyNet Login Module
   * =======================
   *
   * Display login form if required.
   */

  app.modules.login = function() {
    var self = this;
  };
}).call(this);


;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.login = function(dom) {
    var self = this;

    // Give focus to the "password" field:
    // TODO: FIX IT, IT DOES NOT WORK
    $('#login-password', dom).focus();

    $('#login-signin', dom).click(function(e) {
      self.dispatchEvent('login', {
        password: $('#login-password', dom).val()
      });

      e.stopPropagation();
      return false;
    });

    $('#login-forgotpassword', dom).click(function(e) {
      self.dispatchEvent('forgotPassword');

      e.stopPropagation();
      return false;
    });

    $('input', dom).keypress(function(e) {
      if (e.which === 13)
        self.dispatchEvent('login', {
          password: $('#login-password', dom).val()
        });
    });
  };
}).call(this);
