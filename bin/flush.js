var config = require('../server/config.js'),
    CouchbaseRest = require('../lib/couchbase_rest'),
    rest = new CouchbaseRest(config.couchbase);

console.log(rest.getBucket('tubemynet'));