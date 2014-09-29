/**
 * TubeMyNet Utilities
 * ====================
 *
 * Miscellaneous utilities used throughout TubeMyNet's code.
 *
 */
var uuid = require('node-uuid'),
    crypto = require('crypto');

/**
 * Returns whether the variable is a plain JavaScript object.
 */
function isPlainObject(v) {
  return v instanceof Object &&
         !(v instanceof Array) &&
         !(v instanceof Function);
}

/**
 * Returns a unique identifier.
 */
function uuid() {
  return(
    new Buffer(uuid.v4())
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  );
}

/**
 * Encrypt a password.
 */
function encrypt(s) {
  return crypto.createHash('sha256').update(s).digest('base64');
}

/**
 * Recursively extend an object.
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

// Exporting
module.exports = {
  encrypt: encrypt,
  extend: extend,
  indexBy: indexBy,
  isPlainObject: isPlainObject,
  uuid: uuid
};
