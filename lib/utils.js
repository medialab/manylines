var uuid = require('node-uuid'),
    crypto = require('crypto');

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
