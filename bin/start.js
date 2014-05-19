var config = require('../server/config.js');

// Initializing database connection
require('../server/buckets').connect(function() {
  console.log('');

  // Launch API:
  require('../server/api').start(config.api.port);

  // Launch static server:
  require('../server/static').start(config.static.port);
});
