;(function(undefined) {

  /**
   * Sigma Save Camera Plugin
   * =========================
   *
   * A useful sigma.js plugin designed to save relative information about
   * a graph's camera in order to be able to re-apply it later on a
   * potentially different container.
   *
   * Author: Guillaume Plique (Yomguithereal)
   * Version: 0.0.1
   *
   */

  sigma.prototype.saveCamera = function(name) {
    var camera = this.cameras[name];

    var b = sigma.utils.getBoundaries(this.graph, 'read_cam' + camera.id + ':'),
        w = b.maxX - b.minX,
        h = b.maxY - b.minY;

    return {
      x: (camera.x * 100) / w,
      y: (camera.y * 100) / h,
      ratio: camera.ratio,
      angle: camera.angle
    };
  };

  sigma.prototype.retrieveCamera = function(name, save) {
    var camera = this.cameras[name];

    var b = sigma.utils.getBoundaries(this.graph, 'read_cam' + camera.id + ':'),
        w = b.maxX - b.minX,
        h = b.maxY - b.minY;

    return {
      x: (save.x * w) / 100,
      y: (save.y * h) / 100,
      ratio: save.ratio,
      angle: save.angle
    };
  };

  sigma.prototype.loadCamera = function(name, save) {
    var camera = this.cameras[name],
        coord = this.retrieveCamera(name, save);

    camera.goTo(coord);
  };
}).call(this);
