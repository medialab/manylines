var uuid = require('node-uuid');

exports.uuid = function() {
  return(
    new Buffer(uuid.v4())
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  );
};
