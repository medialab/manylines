/**
 * TubeMyNet Models Unit Tests
 * ============================
 *
 */
var assert = require('assert'),
    buckets = require('../server/buckets.js'),
    Model = require('../lib/model.js');

// TODO: find way to disable logger

describe('When using models', function() {
  var test = {};

  before(function(done) {

    // Connecting to Mock bucket
    buckets.connectForTests(done);
    test.bucket = buckets.buckets[Object.keys(buckets.buckets)[0]];
  });

  it('should be possible to instantiate one.', function() {

    // Creating a user model
    test.user = new Model('user', test.bucket, {
      firstname: 'string',
      lastname: 'string'
    });

    assert(test.user.name === 'user');
  });

  it('should be possible to create new items.', function(done) {
    var userData = {firstname: 'Joachim', lastname: 'Murat'};

    test.user.create(userData, function(err, result) {

      // Is the result object correct
      userData.id = result.id;
      assert.deepEqual(result, userData);

      test.userId = result.id;
      done();
    });
  });

  it('should be possible to update items.', function(done) {
    var updateData = {firstname: 'Christophe'};

    test.user.update(test.userId, updateData, function(err, result) {

      assert.deepEqual(
        {firstname: 'Christophe', lastname: 'Murat'},
        {firstname: result.firstname, lastname: result.lastname}
      );
      done();
    });
  });

  it('should be possible to overwrite items.', function(done) {
    var userData = {firstname: 'Louis-Nicolas', lastname: 'Davout'};

    test.user.set(test.userId, userData, function(err, result) {

      // Is the result object correct?
      userData.id = result.id;
      assert.deepEqual(result, userData);

      done();
    });
  });

  it('should return an error when trying to set invalid data.', function(done) {
    var userData = {hello: 'world'};

    test.user.create(userData, function(err, result) {
      assert.equal(err.reason, 'wrong-data');
      done();
    });
  });

  it('should be possible to get an item.', function(done) {

    test.user.get(test.userId, function(err, result) {
      assert.deepEqual({firstname: 'Louis-Nicolas', lastname: 'Davout'}, result);
      done();
    });
  });

  it('should be possible to get multiple items.', function(done) {

    // Setting a second user
    test.user.create({firstname: 'Michel', lastname: 'Ney'}, function(err, result) {

      // Getting multiple users
      test.user.get([test.userId, result.id], function(err, results) {
        assert.deepEqual(
          results,
          [
            {firstname: 'Louis-Nicolas', lastname: 'Davout'},
            {firstname: 'Michel', lastname: 'Ney'}
          ]
        );
        done();
      });
    });
  });

  it('should be possible to get an item with its identifier.', function(done) {

    test.user.get(test.userId, {id: true}, function(err, result) {
      assert(result.id === test.userId);
      done();
    });
  });

  it('should retrieve an inexistant item as null.', function(done) {

    test.user.get('random', function(err, result) {
      assert(result === null);
      done();
    });
  });

  it('should be possible to remove an item.', function(done) {

    test.user.remove(test.userId, function(err) {

      // Is the item really destroyed?
      test.user.get(test.userId, function(err, result) {
        assert(result === null);
        done();
      })
    });
  });

  it('should trigger an error when trying to remove an inexistant item.', function(done) {

    test.user.remove('random', function(err) {
      assert(err.code === 13);
      done();
    });
  });
});
