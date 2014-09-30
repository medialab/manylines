;(function(undefined) {

  /**
   * TubeMyNet Embed Controller
   * ===========================
   *
   * TubeMyNet utility to display the application's widgets.
   */

  /**
   * Namespace
   * ----------
   */
  var embed = {};

  /*--------------------------------------------------------------------------*/

  /**
   * Helpers
   * --------
   */

  function parseHash() {
    var hash = window.location.hash,
        split = hash.split('/');

    return {
      view: split[1],
      id: split[2]
    };
  }

  function gatherTemplates() {
    var templates = {};

    $('[id^=tpl]').each(function() {
      var name = $(this).attr('id').replace(/tpl\-/, '');
      templates[name] = Handlebars.compile($(this).text());
    });

    return templates;
  }

  function getData(view, id, callback) {
    $.get('/api/embed/' + view + '/' + id, callback);
  }

  // TODO: modelize an object to perform this?
  function getSlidePosition(slide) {
    var index = embed.data.narrative.slides.indexOf(slide);

    if (index === 0)
      return 'first';
    else if (index === embed.data.narrative.slides.length - 1)
      return 'last';
    else
      return 'middle';
  }

  function getNextSlide() {
    var index = embed.data.narrative.slides.indexOf(embed.currentSlide);
    return embed.data.narrative.slides[index + 1];
  }

  function getPreviousSlide() {
    var index = embed.data.narrative.slides.indexOf(embed.currentSlide);
    return embed.data.narrative.slides[index - 1];
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Rendering
   * ----------
   */
  function renderSlide() {
    var $container = $('.view-content'),
        $left = $('.left-arrow-container'),
        $right = $('.right-arrow-container');

    // Cleaning
    $container.empty();
    $left.empty();
    $right.empty();

    $container.append(embed.templates.slide(embed.currentSlide));

    var position = getSlidePosition(embed.currentSlide);

    if (position === 'first' || position === 'middle') {

      // We render the right arrow
      var nextSlide = getNextSlide();
      $right.append(embed.templates.right(nextSlide));
    }

    if (position === 'last' || position === 'middle') {

      // We render the left arrow
      var previousSlide = getPreviousSlide();
      $left.append(embed.templates.left(previousSlide));
    }

    // We render the graph
    renderGraph();
  }

  function renderGraph() {
    var snapshot = embed.data.snapshots[embed.currentSlide.snapshot],
        filter = (snapshot.filters[0] || {});

    if (!embed.graphLoaded) {
      embed.sig.graph.read(embed.data.graph);
      embed.graphLoaded = true;
    }

    embed.sig.run(
      'highlightCategoryValues',
      embed.data.categories[filter.category],
      filter.value
    );
    embed.currentCamera = embed.sig.retrieveCamera('main', snapshot.view.camera);

    sigma.misc.animation.camera(
      embed.sig.cameras.main,
      embed.currentCamera,
      { duration: 500, easing: 'cubicInOut' }
    );
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Initialization
   * ---------------
   */
  embed.templates = gatherTemplates();
  embed.params = parseHash();
  embed.data = {};

  embed.graphLoaded = false;
  embed.sig = new sigma({
    settings: {
      animationsTime: 1000,
      hideEdgesOnMove: true,
      font: 'Roboto Condensed',
      fontStyle: '300',
      defaultLabelSize: 13,
      minEdgeSize: 1.5,
      maxEdgeSize: 1.5,
      maxNodeSize: 4,
      defaultEdgeColor: '#ddd',
      defaultNodeColor: '#ccc',
      edgeColor: 'default',
      rescaleIgnoreSize: false,
      labelThreshold: 8,
      singleHover: true,
      zoomMin: 0.002,
      zoomMax: 2
    }
  });

  embed.sig.addCamera('main');

  embed.sig.addRenderer({
    id: 'main',
    camera: 'main',
    container: document.getElementsByClassName('sigma-expand')[0]
  });

  // TODO: Clear that HACK
  // Fixes problem with sigma and window resizing
  window.addEventListener('resize', function() {
    window.setTimeout(embed.sig.refresh.bind(embed.sig), 0);
  });

  if (!embed.params.id || !embed.params.view)
    throw Error('embed: wrong hash parameters.');

  // Fetching needed data
  getData(embed.params.view, embed.params.id, function(data) {
    embed.data = data;
    embed.currentSlide= data.narrative.slides[0];

    // Compute node model
    embed.data.categories =
      embed.utils.indexBy((((embed.data.meta || {}).model || {}).node || []), 'id');

    // Render first slide
    renderSlide();
  });

  /*--------------------------------------------------------------------------*/

  /**
   * Binding Events
   * ---------------
   */

  /**
   * Zooming
   */
  $('*[data-embed-sigma-action="zoom"]').click(function() {
      var cam = embed.sig.cameras.main;

      sigma.misc.animation.camera(
        cam,
        { ratio: cam.ratio / 1.5 },
        { duration: 150 }
      );
    });

  /**
   * Unzooming
   */
  $('*[data-embed-sigma-action="unzoom"]').click(function() {
    var cam = embed.sig.cameras.main;

    sigma.misc.animation.camera(
      cam,
      { ratio: cam.ratio * 1.5 },
      { duration: 150 }
    );
  });

  /**
   * Recentering
   */
  $('*[data-embed-sigma-action="recenter"]').click(function() {
    var cam = embed.sig.cameras.main;

    sigma.misc.animation.camera(
      cam,
      embed.currentCamera,
      { duration: 500, easing: 'cubicInOut' }
    );
  });

  /**
   * Changing slide.
   */
  $('body').on('click', '#left', function() {

    // Changing slide
    embed.currentSlide = getPreviousSlide();
    renderSlide();
  });

  $('body').on('click', '#right', function() {

    // Changing slide
    embed.currentSlide = getNextSlide();
    renderSlide();
  });

  // Exporting for convenience
  this.embed = embed;
}).call(this);
