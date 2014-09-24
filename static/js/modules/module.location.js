;(function(undefined) {

  /**
   * TubeMyNet Location Module
   * ==========================
   *
   * This module tracks changes concerning the url hash and triggers
   * the relevant events.
   */

  app.modules.location = function() {
    var self = this,
        cache = null;

    // Emitters
    window.onhashchange = function() {
      if (cache !== window.location.hash) {
        self.dispatchEvent('hash.changed', {hash: window.location.hash});
        cache = window.location.hash;
      }
    };

    // Receptors
    function updateHash(d) {
      var hash = app.utils.parseHash(window.location.hash);

      var newHash = '/' + d.get('pane');
      d.expand('spaceId') && (newHash += '/' + d.expand('spaceId') + '/' + d.expand('version'))
      d.get('pane') === 'login' && (newHash += '/' + hash.spaceId + '/' + hash.version)
      window.location.hash = newHash;
    }

    this.triggers.events['pane.updated'] = updateHash;
    this.triggers.events['space.updated'] = updateHash;
  };
}).call(this);
