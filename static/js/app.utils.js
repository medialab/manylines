;(function(undefined) {

  /**
   * TubeMyNet Misc Utilities
   * =========================
   *
   * JVarious useful functions used throughout the application code.
   */

  function isPlainObject(v) {
    return v instanceof Object &&
           !(v instanceof Array) &&
           !(v instanceof Function);
  }

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

  function first(a, fn, scope) {
    for (var i = 0, l = a.length; i < l; i++) {
      if (fn.call(scope || null, a[i]))
        return a[i];
    }
    return;
  }

  // Exporting
  app.utils = {
    extend: extend,
    first: first
  };
}).call(this);
