var uuid = require('node-uuid'),
    crypto = require('crypto');

function isPlainObject(v) {
  return typeof v === 'object' && !(v instanceof Array);
}

exports.uuid = function() {
  return(
    new Buffer(uuid.v4())
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  );
};

exports.encrypt = function(s) {
  return crypto.createHash('sha256').update(s).digest('base64');
};

function extend() {
  var i,
      k,
      res = {},
      l = arguments.length;

  for (i = l - 1; i >= 0; i--)
    for (k in arguments[i])
      if (isPlainObject(arguments[i][k]))
        res[k] = extend((arguments[i - 1] || {})[k], arguments[i][k]);
      else
        res[k] = arguments[i][k];

  return res;
}

exports.extend = extend;
