;(function(undefined) {

  /**
   * Manylines Misc Utilities
   * =========================
   *
   * Various useful functions used throughout the application code.
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
   * Retrieve the index of the first element matching function or -1
   */
  function indexOf(a, fn) {
    var i, l;

    for (i = 0, l = a.length; i < l; i++) {
      if (fn(a[i]))
        return i;
    }
    return -1;
  }

  /**
   * Mute a color using chroma scales.
   */
  function muteColor(color) {
    var rgb = chroma(color).rgb(),
        m = 248;

    // Chroma deals with the potentially negative numbers, no need to worry
    for (var i = 0; i < 3; i++)
      rgb[i] = m - 0.1 * (m - rgb[i]);

    return chroma.rgb(rgb).hex();
  }

  /**
   * Parse a hash
   */
  function parseHash(hash) {
    var hs = hash.split('/');

    return {
      pane: hs[1],
      spaceId: hs[2],
      version: hs[3]
    };
  }

  // Exporting
  ('app' in this ? app : embed).utils = {
    extend: extend,
    first: first,
    indexBy: indexBy,
    indexOf: indexOf,
    muteColor: muteColor,
    parseHash: parseHash
  };
}).call(this);
