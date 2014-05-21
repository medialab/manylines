var config = require('../server/config.js'),
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

buckets.forEach(function(bucket) {
  console.log('Flushing bucket "' + bucket + '"...');
  rest.flushBucket(bucket);
});
