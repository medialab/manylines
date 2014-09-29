;(function(undefined) {

  /**
   * TubeMyNet ForceAtlas Module
   * ============================
   *
   * A simple submodule to plug when Force Atlas 2 Layout is required.
   */

  app.modules.forceAtlas = function(dom, parent) {
    var self = this,
        s = app.control.get('mainSigma');

    /**
     * Starting layout
     */
    dom.on('click', '*[data-app-basemap-action="startLayout"]', function(e) {

      // If a snapshot has already been taken, we urge the user to bump
      // TODO: move this logic elsewhere (in a hack typically)
      if (app.control.expand('hasSnapshots'))
        return self.dispatchEvent('modal', {type: 'bump'});

      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'on');
      var settings = app.control.expand('forceAtlasConfig');

      // Opening panel if needed
      parent.openPanel('force');

      // Configuring and starting ForceAtlas2
      s.configForceAtlas2(settings);
      s.startForceAtlas2();

      e.preventDefault();

      // Dispatching
      self.dispatchEvent('layout.start');
    });

    /**
     * Stopping layout
     */
    dom.on('click', '*[data-app-basemap-action="stopLayout"]', function(e) {
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'off');

      // Stopping ForceAtlas2
      s.stopForceAtlas2();

      e.preventDefault();

      // Dispatching
      self.dispatchEvent('layout.stop');
    });

    /**
     * Updating layout settings
     */
    dom.on('change', '*[data-app-basemap-layout-option]', function(e) {
      var settings = app.control.expand('forceAtlasConfig'),
          opt = {};

      opt[$(this).attr('data-app-basemap-layout-option')] =
        value = $(this).is('[type=checkbox]') ?
          $(this).prop('checked') :
          +$(this).val();

      // Visual update
      if (opt.gravity)
        opt.gravity /= 1000;

      self.dispatchEvent('layout.update', app.utils.extend(opt, settings));
    });

    /**
     * Receptors
     */
    this.triggers.events['layout.updated'] = function(d, e) {
      s.configForceAtlas2(e.data);
    };

    this.unmount = function() {
      s.killForceAtlas2();
    };
  };
}).call(this);
