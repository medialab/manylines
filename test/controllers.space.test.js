/**
 * TubeMyNet Space Controller Unit Tests
 * ======================================
 *
 */
var assert = require('assert'),
    request = require('supertest'),
    test = require('./setup.js'),
    app = require('../server/api.js').app,
    agent = request.agent(app);

function shouldItStop(err) {
  if (err instanceof Error)
    throw err;
}

describe('When hitting the space controller', function() {
  var cache = {};

  it('should return a 401 when attempting to log with wrong credentials.', function(done) {
    agent
      .get('/api/login/unkwnown/wrong')
      .expect(401, done);
  });

  it('should shun people without correct authentification.', function(done) {
    agent
      .get('/api/logout/unkwnown')
      .expect(401, done);
  });

  it('should fail when sending wrong data to create a space.', function(done) {
    agent
      .post('/api/space')
      .send({hello: 'world'})
      .expect(400, done);
  });

  it('should be possible to create a space.', function(done) {
    var data = {
      email: 'test@test.com',
      password: 'secret',
      graph: test.samples.graph,
      metas: test.samples.metas
    };

    agent
      .post('/api/space')
      .send(data)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {

        // Checking results
        assert(!!res.body.id);
        assert(res.body.email === data.email);
        assert(res.body.version === 1);

        // Caching
        cache.spaceId = res.body.id;
        done();
      });
  });

  it('should fail when trying to create a space with an invalid email.', function(done) {
    var data = {
      email: 'wrongmail',
      password: 'secret',
      graph: test.samples.graph,
      metas: test.samples.metas
    };

    agent
      .post('/api/space')
      .send(data)
      .expect(400)
      .end(function(err, res) {
        assert(res.text === 'INVALID_EMAIL');
        done();
      });
  });

  it('should fail when trying to create a space with an invalid password.', function(done) {
    var data = {
      email: 'test@test.com',
      password: 'lol',
      graph: test.samples.graph,
      metas: test.samples.metas
    };

    agent
      .post('/api/space')
      .send(data)
      .expect(400)
      .end(function(err, res) {
        assert(res.text === 'INVALID_PASSWORD');
        done();
      });
  });

  it('should be possible to update a space.', function(done) {
    var data = {
      email: 'new@mail.com',
      password: 'newpassword'
    };

    agent
      .post('/api/space/' + cache.spaceId)
      .send(data)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {

        // Checking results
        assert(res.body.id === cache.spaceId);
        assert(res.body.email === data.email);
        assert(res.body.version === 1);
        done();
      });
  });

  it('should be possible to retrieve some graph data.', function(done) {
    agent
      .get('/api/space/' + cache.spaceId + '/graph/' + 0)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err)
          throw err;

        assert.deepEqual(res.body, test.samples.graph);
        done();
      });
  });

  it('should return a 404 when trying to retrieve an inexistant graph\'s data.', function(done) {
    agent
      .get('/api/space/' + cache.spaceId + '/graph')
      .expect(404, done);
  });

  it('should be possible to logout.', function(done) {
    agent
      .get('/api/logout/' + cache.spaceId)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err)
          throw err;

        assert(res.body.ok);
        done();
      });
  });
});
