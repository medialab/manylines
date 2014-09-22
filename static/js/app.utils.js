;(function(undefined) {

  /**
   * TubeMyNet Misc Utilities
   * =========================
   *
   * JVarious useful functions used throughout the application code.
   */

  /**
   * Returning whether the given variable is a plain JavaScript object or not.
   */
  function isPlainObject(v) {
    return v instanceof Object &&
           !(v instanceof Array) &&
           !(v instanceof Function);
  }

  /**
   * Merging one or more objects into another recursively. First one wins.
   */
  function extend() {
    var i,
        k,
        res = {},
        l = arguments.length;

    for (i = l - 1; i >= 0; i--)
      for (k in arguments[i])
        if (res[k] && isPlainObject(arguments[i][k]))
          res[k] = extend(arguments[i][k], res[k]);
        else
          res[k] = arguments[i][k];

    return res;
  }

  /**
   * Retrieve the first element in an array to return true to the passed function.
   */
  function first(a, fn, scope) {
    for (var i = 0, l = a.length; i < l; i++) {
      if (fn.call(scope || null, a[i]))
        return a[i];
    }
    return;
  }

  /**
   * Index an array on the given key or function.
   */
  function indexBy(a, key) {
    var index = {},
        i,
        l;

    for (i = 0, l = a.length; i < l; i++) {
      if (typeof key === 'function') {
        var res = key(a[i]);
        index[res[0]] = res[1];
      }
      else {
        index[a[i][key]] = a[i];
      }
    }

    return index;
  }

  /**
   * Mute a color using chroma scales.
   */
  function muteColor(color) {
    var rgb = chroma(color).rgb(),
        m = app.settings.colors.mutedBasis;

    // Chroma deals with the potentially negative numbers, no need to worry
    for (var i = 0; i < 3; i++)
      rgb[i] = m - 0.1 * (m - rgb[i]);

    return chroma.rgb(rgb).hex();
  }

  // Exporting
  app.utils = {
    extend: extend,
    first: first,
    indexBy: indexBy,
    muteColor: muteColor
  };
}).call(this);
