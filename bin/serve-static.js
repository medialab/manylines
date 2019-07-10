var config = require('../server/config.js');

// Launch static server:
require('../server/static.js').start(config.static.port);
