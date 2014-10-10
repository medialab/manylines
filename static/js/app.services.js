;(function(undefined) {

  /**
   * Manylines Services
   * ===================
   *
   * Bridge to the API.
   */

  // Default parameters
  var defaults = {
    type: 'GET',
    dataType: 'json',
    contentType: 'application/json'
  };

  // Repeating logic
  function onUnauthorized(m, x, p) {
    if (x.status)
      this.dispatchEvent('error', {reason: 'errors.unauthorized'});
    else
      this.dispatchEvent('error', {reason: 'errors.unknown'});
  }

  function onInvalidData(m, x, p) {
    if (m === 'INVALID_EMAIL')
      this.dispatchEvent('warning', {reason: 'warnings.invalid_email'});
    else if (m === 'INVALID_PASSWORD')
      this.dispatchEvent('warning', {reason: 'warnings.invalid_password'});
    else
      this.dispatchEvent('error', {reason: 'errors.unknown'});
  }

  function onLoginNeeded(m, x, p) {
    if (+x.status === 401)
      this.dispatchEvent('login.required');
    else
      this.dispatchEvent('error', {reason: 'errors.unknown'});
  }

  // Services
  app.services = [

    /**
     * Login
     * ------
     */
    {
      id: 'login',
      url: '/api/login/:spaceId/:password',
      success: function(data) {
        var lastPane = this.get('lastPane');

        // Updating properties
        this.update('space', data);

        // Requesting more data
        this.dispatchEvent('data.load');
      },
      error: function(m, x, p) {
        if (x.status)
          this.dispatchEvent('error', {reason: 'errors.wrong_password'});
        else
          this.dispatchEvent('error', {reason: 'errors.unknown'});
      }
    },
    {
      id: 'logout',
      url: '/api/logout/:spaceId',
      success: function(data) {

        // Updating properties
        this.update('space', null);
        this.update('pane', 'upload');
      },
      error: onUnauthorized
    },

    /**
     * Space management
     * -----------------
     */
    {
      id: 'space.create',
      url: '/api/space',
      type: 'POST',
      before: function() {

        // Do not create a space if the space is already created
        return this.expand('isSpaceNew');
      },
      success: function(data) {

        // Updating properties
        this.update('space', data);
        this.update('modified', {});
      },
      error: onInvalidData
    },
    {
      id: 'space.bump',
      url: '/api/space/:spaceId/bump',
      type: 'POST',
      success: function(data) {

        // Updating properties
        var space = this.get('space');
        space.version = data.version;

        this.update('space', space);
        this.update('snapshots', []);
        this.update('narratives', []);
        this.update('currentNarrative', null);
        this.update('currentSlide', null);

        // Updating hash to display new version
        this.dispatchEvent('hash.update');
      }
    },
    {
      id: 'space.load',
      url: '/api/space/:spaceId/:version',
      success: function(data) {

        // Updating properties
        this.update('space', data.space);
        this.update('graph', data.graph);
        this.update('meta', data.meta);
        this.update('snapshots', data.snapshots);

        this.update('pane', this.get('lastPane') || 'basemap');
        this.update('lastPane', null);

        this.dispatchEvent('graph.render');
      },
      error: onLoginNeeded
    },

    /**
     * Data Update
     * ------------
     */
    {
      id: 'graph.update',
      url: '/api/space/:spaceId/graph/:version',
      type: 'POST',
      success: function(data) {
        var modified = this.get('modified');
        delete modified.graph;
        this.update('modified', modified);
      }
    },
    {
      id: 'meta.update',
      url: '/api/space/:spaceId/meta/:version',
      type: 'POST',
      success: function(data) {
        var modified = this.get('modified');
        delete modified.meta;
        this.update('modified', modified);
      }
    },

    /**
     * Snapshots management
     * ---------------------
     */
    {
      id: 'snapshot.save',
      url: '/api/space/:spaceId/snapshot/:version',
      type: 'POST',
      success: function(data, sent)  {
        this.dispatchEvent('success', {reason: 'snapshots.saved'});
        this.dispatchEvent('snapshot.taken');

        // Updating snapshots list
        var snapshots = this.get('snapshots');
        snapshots.push(app.utils.extend(sent.data.snapshot, {id: data.id}));
        this.update('snapshots', snapshots);
      }
    },
    {
      id: 'snapshots.load',
      url: '/api/space/:spaceId/snapshots/:version',
      type: 'GET',
      success: function(data) {
        this.update('snapshots', data);
      }
    },

    /**
     * Narratives management
     * ----------------------
     */
    {
      id: 'narrative.save',
      url: '/api/space/:spaceId/narrative/:version',
      type: 'POST',
      success: function(data) {
        var narratives = this.get('narratives'),
            modified = this.get('modified');

        var temp = app.utils.first(narratives, function(n) {
          return n.id === 'temp';
        });

        temp.id = data.id;
        modified.narratives.splice(modified.narratives.indexOf('temp'), 1);

        if (!modified.length)
          delete modified.narratives;

        this.update('narratives', narratives);
        this.update('modified', modified);

        if (this.get('currentNarrative') === 'temp')
          this.update('currentNarrative', data.id);
      }
    },
    {
      id: 'narrative.update',
      url: '/api/narrative/:id',
      type: 'POST',
      success: function(data, sent) {
        var modified = this.get('modified'),
            index = app.utils.indexOf(modified.narratives, function(nid) {
              return sent.data.narrative.id === nid;
            });

        modified.narratives.splice(index, 1);

        this.update('modified', modified);
      }
    },
    {
      id: 'narratives.load',
      url: '/api/space/:spaceId/narratives/:version',
      type: 'GET',
      success: function(data) {

        // Re-arranging data
        data = data.map(function(narrative) {
          return {
            id: narrative.id,
            title: narrative.title,
            slides: narrative.slides
          };
        });

        this.update('narratives', data);
      }
    }
  ];

  // Applying defaults
  app.services = app.services.map(function(service) {
    return app.utils.extend(service, defaults);
  });
}).call(this);
