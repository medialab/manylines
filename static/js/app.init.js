;(function(undefined) {

  /**
   * TubeMyNet Application Initialization
   * =====================================
   *
   * Instantiating the controller and launching the application.
   */

  // Setup domino
  domino.settings(app.settings.domino);

  // Setup controller
  app.control = new domino({
    properties: app.properties,
    services: app.services
  });

  // Setup facets
}).call(this);
