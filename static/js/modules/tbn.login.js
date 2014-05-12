;(function() {
  'use strict';

  tbn.pkg('tbn.modules');
  tbn.modules.login = function(dom) {
    var self = this;

    // Give focus to the "password" field:
    // TODO: FIX IT, IT DOES NOT WORK
    // $('#login-password', dom).focus();

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
  };
}).call(this);
