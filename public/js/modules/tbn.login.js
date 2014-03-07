;(function() {
  'use strict';

  tbn.pkg('tbn.modules');
  tbn.modules.login = function(dom) {
    var self = this;

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
