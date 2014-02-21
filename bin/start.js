var config = require('../config.json');

// Launch API:
require('../server/api.js').start(config.api.port);

// Launch static server:
require('../server/static.js').start(config.static.port);
