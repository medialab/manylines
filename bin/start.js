var config = require('../server/config.js');

// Initializing database connection
require('../server/buckets.js').connect(function() {
  console.log('');

  // Initializing models
  require('../server/models.js').init();

  // Launch API:
  require('../server/api.js').start(config.api.port);

  // Launch static server:
  require('../server/static.js').start(config.static.port);
});
