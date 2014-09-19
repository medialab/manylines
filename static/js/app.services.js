;(function(undefined) {

  /**
   * TubeMyNet Services
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
    console.log(this);
    if (x.status)
      this.dispatchEvent('error', {reason: 'unauthorized'});
    else
      this.dispatchEvent('error', {reason: 'unknown'});
  }

  function onInvalidData(m, x, p) {
    if (m === 'INVALID_EMAIL')
      this.dispatchEvent('warning', {reason: 'invalid_email'});
    else if (m === 'INVALID_PASSWORD')
      this.dispatchEvent('warning', {reason: 'invalid_password'});
    else
      this.dispatchEvent('error', {reason: 'unknown'});
  }

  function onLoginNeeded(m, x, p) {
    if (+x.status === 401)
      this.dispatchEvent('login.required');
    else
      this.dispatchEvent('error', {reason: 'unknown'});
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
        this.update('lastPane', null);
        this.update('pane', lastPane || 'basemap');
      },
      error: onUnauthorized
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
      id: 'space.load',
      url: '/api/space/:spaceId/:version',
      success: function(data) {

        // Updating properties
        this.update('space', data.space);
        this.update('graph', data.graph);
        this.update('meta', data.meta);
        this.update('snapshots', data.snapshots);

        // Updating graph
        // TODO: put this elsewhere
        var s = this.get('mainSigma');
        s.graph.clear().read(data.graph);
        s.refresh();
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
    }
  ];

  // Applying defaults
  app.services = app.services.map(function(service) {
    return app.utils.extend(service, defaults);
  });
}).call(this);
