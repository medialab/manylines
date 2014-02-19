var config = require('../config.json');

// Launch API:
require('../server/api.js').start(config.api.port);

// Launch static server:
var connect = require('connect');
connect.createServer(
    connect.static(__dirname + '/../' + config.static.path)
).listen(config.static.port);
