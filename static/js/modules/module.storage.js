;(function(undefined) {

  /**
   * Manylines Storage Module
   * =========================
   *
   * Stores temporary data into the HTML5 storage to ensure one would not
   * lose his work when reloading the page and so on...
   */

  app.modules.storage = function() {
    var self = this,
        enabled = !app.control.expand('spaceId');

    if (!enabled)
      clear();

    // Functions
    function save(d) {
      if (!enabled)
        return;

      var data = {};

      data.space = d.get('space');
      data.meta = d.get('meta');
      data.graph = d.get('graph');
      data.modified = d.get('modified');
      data.narratives = d.get('narratives');

      try {
        localStorage.setItem(
          app.settings.storage.key,
          JSON.stringify(data)
        );
      } catch (e) {
        enabled = false;
      }
    }

    function load(d) {
      if (!enabled)
        return;

      var data = null;

      try {
        data = JSON.parse(localStorage.getItem(app.settings.storage.key));
      } catch (e) {
        enabled = false;
      }

      self.dispatchEvent('storage.loaded', {storage: data});
    }

    function clear() {
      if (!enabled)
        return;

      try {
        localStorage.removeItem(app.settings.storage.key);
      } catch (e) {
        enabled = false;
      }
    }

    // Receptors
    this.triggers.events['data.updated'] = save;
    this.triggers.events['modified.updated'] = save;
    this.triggers.events['storage.load'] = load;
    this.triggers.events['storage.clear'] = clear;
  };
}).call(this);
