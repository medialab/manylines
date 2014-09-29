/**
 * TubeMyNet Space Controller
 * ===========================
 *
 */
var validator = require('validator');

var repositories = {
  login: require('../repositories/login.js'),
  space: require('../repositories/space.js')
};

// Actions definition
module.exports = {

  /**
   * login:
   * ------
   * This route will log an user into a precise space.
   *
   */
  login: {
    validate: {
      id: 'string',
      password: 'string'
    },
    method: function(req, res) {
      var id = req.param('id'),
          password = req.param('password');

      // Checking login
      repositories.login.authenticate(id, password, function(result) {

        // Fail
        if (!result)
          return res.error('Unauthorized', 401);

        // Success - we had the space to the session and we reply
        req.session.spaces = req.session.spaces || {};
        req.session.spaces[id] = result;

        return res.json({
          id: id,
          email: result.email,
          version: result.graphs.length - 1
        });
      });
    }
  },

  /**
   * logout:
   * -------
   * This route is able to log a user off a precise space or every spaces if
   * no space id is specified.
   *
   */
  logout: {
    validate: {
      id: '?string'
    },
    policies: 'authenticated',
    method: function(req, res) {
      var id = req.param('id');

      if (id) {

        // We remove the given space from user's session
        delete req.session.spaces[id];
      }
      else {

        // We remove every spaces from user's session
        delete req.session.spaces;
      }

      // Reply
      return res.json({ok: true});
    }
  },

  /**
   * get:
   * ----
   * Retrieve a space and the graph/meta/snapshot result for a given version of
   * this space.
   *
   */
  get: {
    validate: {
      id: 'string',
      version: 'string'
    },
    policies: 'authenticated',
    method: function(req, res) {
      var id = req.param('id'),
          version = req.param('version');

      repositories.space.getVersion(id, version, function(err, result) {
        if (err)
          return res.error(err, 404);

        res.json({
          space: {
            id: id,
            email: result.space.email,
            version: +version
          },
          graph: result.graph,
          meta: result.meta,
          snapshots: result.snapshots
        });
      });
    }
  },

  /**
   * create:
   * -------
   * This route will create a new space, with the given graph.
   *
   */
  create: {
    validate: {
      email: 'string',
      password: 'string',
      graph: {
        nodes: 'array',
        edges: 'array'
      },
      meta: 'object'
    },
    method: function(req, res) {
      var email = req.param('email'),
          password = req.param('password');

      // Custom errors on invalid email or password
      if (!validator.isEmail(email))
        return res.error('INVALID_EMAIL', 400);
      if (!validator.isLength(password, 5))
        return res.error('INVALID_PASSWORD', 400);

      // Initializing the space
      repositories.space.initialize(
        email,
        password,
        req.param('graph'),
        req.param('meta'),
        function(err, space) {
          if (err)
            return res.error('Error on space initialization.');

          // Starting a session and sending reply
          req.session.spaces = req.session.spaces || {};
          req.session.spaces[space.id] = space;

          return res.json({
            id: space.id,
            email: space.email,
            version: 0
          });
        }
      );
    }
  },

  /**
   * update:
   * -------
   * This route will update the meta of a space.
   *
   * Params:
   *   - id: string
   *       The space ID.
   *   - email: ?string
   *       The space email.
   *   - password: ?string
   *       The space password.
   */
  update: {
    validate: {
      id: 'string',
      email: '?string',
      password: '?string'
    },
    policies: 'authenticated',
    method: function(req, res) {
      var id = req.param('id'),
          email = req.param('email'),
          password = req.param('password');

      // Custom errors on invalid email or password
      if (email && !validator.isEmail(email))
        return res.error('INVALID_EMAIL', 400);
      if (password && !validator.isLength(password, 5))
        return res.error('INVALID_PASSWORD', 400);

      // Updating space
      repositories.space.update(id, email, password, function(err, result) {
        if (err)
          return res.error('Error on space update.');

        // Updating session
        req.session.spaces[id] = result;

        return res.json({
          id: id,
          email: result.email,
          version: result.graphs.length
        });
      });
    }
  },

  bump: {
    validate: {
      id: 'string',
      graph: {
        nodes: 'array',
        edges: 'array'
      },
      meta: 'object'
    },
    policies: 'authenticated',
    method: function(req, res) {
      repositories.space.bump(
        req.param('id'),
        req.param('graph'),
        req.param('meta'),
        function(err, space) {
          if (err)
            return res.error('Error on space bump.');

          return res.json({
            id: space.id,
            version: space.graphs.length - 1
          });
        }
      );
    }
  }
};
