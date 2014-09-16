/**
 * TubeMyNet Space API Tests
 * ==========================
 *
 */
var assert = require('assert'),
    request = require('supertest'),
    test = require('./setup.js'),
    app = require('../server/api.js').app,
    agent = request.agent(app),
    utils = require('../lib/utils.js'),
    types = require('typology'),
    models = require('../server/models.js'),
    schemas = require('../server/schemas.js');

describe('Concerning the API', function() {
  var cache = {};

  // LOGIN
  describe('when dealing with login', function() {
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
  });

  // SPACES
  describe('when dealing with spaces', function() {
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
        meta: test.samples.meta
      };

      agent
        .post('/api/space')
        .send(data)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err)
            throw err;

          // Checking results
          assert(!!res.body.id);
          assert(res.body.email === data.email);
          assert(res.body.version === 1);

          // Caching
          cache.spaceId = res.body.id;
          done();
        });
    });

    it('should be possible to get a space version.', function(done) {
      agent
        .get('/api/space/' + cache.spaceId + '/0')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err)
            throw err;

          assert(res.body.space.email === 'test@test.com');
          assert(res.body.graph.nodes.length === 2);
          assert.deepEqual(res.body.meta, test.samples.meta);
          done();
        });
    });

    it('should fail when trying to create a space with an invalid email.', function(done) {
      var data = {
        email: 'wrongmail',
        password: 'secret',
        graph: test.samples.graph,
        meta: test.samples.meta
      };

      agent
        .post('/api/space')
        .send(data)
        .expect(400)
        .end(function(err, res) {
          if (err)
            throw err;

          assert(res.text === 'INVALID_EMAIL');
          done();
        });
    });

    it('should fail when trying to create a space with an invalid password.', function(done) {
      var data = {
        email: 'test@test.com',
        password: 'lol',
        graph: test.samples.graph,
        meta: test.samples.meta
      };

      agent
        .post('/api/space')
        .send(data)
        .expect(400)
        .end(function(err, res) {
          if (err)
            throw err;

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
          if (err)
            throw err;

          // Checking results
          assert(res.body.id === cache.spaceId);
          assert(res.body.email === data.email);
          assert(res.body.version === 1);
          done();
        });
    });
  });

  // GRAPHS
  describe('when dealing with graphs', function() {
    it('should be possible to retrieve some graph data.', function(done) {
      agent
        .get('/api/space/' + cache.spaceId + '/graph/0')
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
        .get('/api/space/' + cache.spaceId + '/graph/1')
        .expect(404, done);
    });

    it('should be possible to update graph data.', function(done) {
      var newGraph = utils.extend(test.samples.graph);
      newGraph.nodes.push({id: 'n03'});

      agent
        .post('/api/space/' + cache.spaceId + '/graph/0')
        .send({graph: newGraph})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err)
            throw err;

          assert(res.body.ok);

          // Checking data in model
          models.space.get(cache.spaceId, function(err, space) {
            models.graph.get(space.graphs[0].id, function(err, data) {
              assert.deepEqual(newGraph, data);
              done();
            })
          });
        });
    });
  });

  // SNAPSHOTS
  describe('when dealing with snapshots', function() {
    it('should be possible to add a snapshot.', function(done) {
      agent
        .post('/api/space/' + cache.spaceId + '/snapshot/0')
        .send({snapshot: test.samples.snapshot})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err)
            throw err;

          assert(!!res.body.id);
          cache.snapshotId = res.body.id;
          done();
        });
    });

    it('should be possible to retrieve snapshots.', function(done) {
      agent
        .get('/api/space/' + cache.spaceId + '/snapshots/0')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err)
            throw err;

          assert(!!res.body.length);
          assert(types.check(res.body[0], schemas.snapshot));
          done();
        });
    });
  });

  // NARRATIVES
  describe('when dealing with narratives', function() {
    it('should be possible to add a narrative.', function(done) {
      test.samples.narrative.slides[0].snapshot = cache.snapshotId;

      agent
        .post('/api/space/' + cache.spaceId + '/narrative/0')
        .send({narrative: test.samples.narrative})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err)
            throw err;

          assert(!!res.body.id);
          cache.narrativeId = res.body.id;
          done();
        });
    });

    it('should be possible to update a narrative.', function(done) {
      test.samples.narrative.title = 'Updated title';

      agent
        .post('/api/narrative/' + cache.narrativeId)
        .send({narrative: test.samples.narrative})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err)
            throw err;

          assert(res.body.ok);
          done();
        });
    });

    it('should be possible to retrieve every narratives for a given space version.', function(done) {
      agent
        .get('/api/space/' + cache.spaceId + '/narratives/0')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err)
            throw err;

          assert(res.body.length === 1);
          assert(res.body[0].slides.length === 1);
          assert(res.body[0].title === 'Updated title');
          done();
        });
    });
  });

  // MISC
  describe('when dealing with miscellaneous things', function() {
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
});
