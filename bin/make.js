var async = require('async'),
    config = require('../server/config.js'),
    CouchbaseRest = require('../lib/couchbase_rest'),
    rest = new CouchbaseRest(config.couchbase);

// Getting different buckets
var buckets = [],
    b,
    i;

for (i in config.couchbase.buckets) {
  b = config.couchbase.buckets[i];

  if (!~buckets.indexOf(b))
    buckets.push(b);
}

// Checking whether bucket exists, if not, we create it
function makeFn(name) {
  return function(callback) {

    // Checking whether bucket exists
    rest.getBucket(name, function(err, bucket) {
      if (err)
        return callback(err);

      // Bucket is inexistant, we create it
      if (!bucket)
        rest.createBucket(name, function(err) {
          console.log('bucket "' + name + '" correctly created.');
          callback();
        });
      else
        console.log('bucket "' + name + '" already exists. Skipping...');
    });
  }
}

async.parallel(buckets.map(makeFn), function(err) {
  if (err)
    throw 'make: error while creating couchbase buckets';
});
