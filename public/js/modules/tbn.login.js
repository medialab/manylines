;(function() {
  'use strict';

  tbn.pkg('tbn.modules');
  tbn.modules.login = function(dom) {
    var self = this;

    // Give focus to the "password" field:
    // TODO: FIX IT, IT DOES NOT WORK
    // $('#login-password', dom).focus();

    $('#login-signin', dom).click(function() {
      self.dispatchEvent('signin', {
        password: $('#login-password', dom).val()
      });
    });

    $('#login-forgotpassword', dom).click(function() {
      self.dispatchEvent('forgotPassword');
    });
  };
}).call(this);
