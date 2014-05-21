;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.basemap = function(dom, d) {
    var self = this,
        s = d.get('mainSigma'),
        renderer = s.addRenderer({
          container: $('.sigma-panel .sigma-expand', dom)[0],
          camera: 'mainCamera',
          id: 'tubemynet-basemap'
        });

    // Refresh rendering:
    s.refresh();

    // Bind sigma buttons:
    $('*[data-app-basemap-action="zoom"]', dom).click(function() {
      var cam = s.cameras.mainCamera;

      sigma.misc.animation.camera(
        cam,
        { ratio: cam.ratio / 1.5 },
        { duration: 150 }
      );
    });
    $('*[data-app-basemap-action="unzoom"]', dom).click(function() {
      var cam = s.cameras.mainCamera;

      sigma.misc.animation.camera(
        cam,
        { ratio: cam.ratio * 1.5 },
        { duration: 150 }
      );
    });
    $('*[data-app-basemap-action="recenter"]', dom).click(function() {
      var cam = s.cameras.mainCamera;

      sigma.misc.animation.camera(
        cam,
        { x: 0,
          y: 0,
          angle: 0,
          ratio: 1 },
        { duration: 150 }
      );
    });

    // Bind layout:
    $('*[data-app-basemap-action="startLayout"]', dom).click(function(e) {
      s.startForceAtlas2();
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'on');
      e.preventDefault();
    });
    $('*[data-app-basemap-action="stopLayout"]', dom).click(function(e) {
      s.stopForceAtlas2();
      $('div[data-app-basemap-switchlayout]', dom).attr('data-app-basemap-switchlayout', 'off');
      e.preventDefault();
    });

    this.kill = function() {
      s.killForceAtlas2().killRenderer('tubemynet-basemap');
    };
  };
}).call(this);
