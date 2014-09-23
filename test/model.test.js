/**
 * TubeMyNet Models Unit Tests
 * ============================
 *
 */
var assert = require('assert'),
    test = require('./setup.js');

describe('Concerning models', function() {
  var cache = {};

  it('should be possible to instantiate one.', function() {
    assert(test.models.user.name === 'user');
  });

  it('should be possible to create new items.', function(done) {
    var userData = {firstname: 'Joachim', lastname: 'Murat'};

    test.models.user.create(userData, function(err, result) {

      // Is the result object correct
      userData.id = result.id;
      assert.deepEqual(result, userData);

      cache.userId = result.id;
      done();
    });
  });

  it('should be possible to update items.', function(done) {
    var updateData = {firstname: 'Christophe'};

    test.models.user.update(cache.userId, updateData, function(err, result) {

      assert.deepEqual(
        {firstname: 'Christophe', lastname: 'Murat'},
        {firstname: result.firstname, lastname: result.lastname}
      );
      done();
    });
  });

  it('should be possible to overwrite items.', function(done) {
    var userData = {firstname: 'Louis-Nicolas', lastname: 'Davout'};

    test.models.user.set(cache.userId, userData, function(err, result) {

      // Is the result object correct?
      userData.id = result.id;
      assert.deepEqual(result, userData);

      done();
    });
  });

  it('should return an error when trying to set invalid data.', function(done) {
    var userData = {hello: 'world'};

    test.models.user.create(userData, function(err, result) {
      assert(err instanceof Error);
      done();
    });
  });

  it('should be possible to get an item.', function(done) {

    test.models.user.get(cache.userId, function(err, result) {
      assert.deepEqual({firstname: 'Louis-Nicolas', lastname: 'Davout'}, result);
      done();
    });
  });

  it('should be possible to get multiple items.', function(done) {

    // Setting a second user
    test.models.user.create({firstname: 'Michel', lastname: 'Ney'}, function(err, result) {

      // Getting multiple users
      test.models.user.get([cache.userId, result.id], function(err, results) {
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

    test.models.user.get(cache.userId, {id: true}, function(err, result) {
      assert(result.id === cache.userId);
      done();
    });
  });

  it('should retrieve an inexistant item as null.', function(done) {

    test.models.user.get('random', function(err, result) {
      assert(err === null);
      assert(result === null);
      done();
    });
  });

  it('should be possible to remove an item.', function(done) {

    test.models.user.remove(cache.userId, function(err) {

      // Is the item really destroyed?
      test.models.user.get(cache.userId, function(err, result) {
        assert(result === null);
        done();
      })
    });
  });

  it('should trigger an error when trying to remove an inexistant item.', function(done) {

    test.models.user.remove('random', function(err) {
      assert(err.code === 13);
      done();
    });
  });
});
