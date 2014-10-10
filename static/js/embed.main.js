;(function(undefined) {

  /**
   * Manylines Embed Controller
   * ===========================
   *
   * Manylines utility to display the application's widgets.
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
    return $.get('/api/embed/' + view + '/' + id, callback);
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
    // add information on total number of slides and current slide.

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
        $wrapper = $('.view-content-wrapper'),
        $left = $('.left-arrow-container'),
        $right = $('.right-arrow-container');


    // Cleaning
    $container.empty();
    $left.empty();
    $right.empty();

    // adding info to current sldie...
    embed.currentSlide.text = embed.currentSlide.text.replace('\n', '<br/>');
    embed.currentSlide.total = embed.data.narrative.slides.length;


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


    // Update slide text scrollbar
    $container.scrollTop(0);

    // We render the legend
    renderLegend();

    // We render the graph
    renderGraph();
  }


  function renderLegend() {
    var $container = $('#view-legend'),
        $wrapper = $(".legend-wrapper"),

        snapshot = embed.data.snapshots[embed.currentSlide.snapshot],
        filter = snapshot.filters.length ? snapshot.filters[0] : {};

    // Clearing container
    $container.empty();

    if(!filter.category) {
      $wrapper.removeClass('opened').css('height', '').removeClass('active');
      return;
    }

    $wrapper.addClass('active');
    
    

    var category = embed.data.categories[filter.category],
        renderingData = {
          title: category.title,
          values: !filter.values.length ?
            category.values :
            category.values.filter(function(v) {
              return ~filter.values.indexOf(v.id);
            })
        };

    $("#view-legend").empty().append(embed.templates.categories(renderingData));
    resizeLegend();

  }


  function resizeLegend() {
    var $wrapper = $(".legend-wrapper"),
        $categories = $wrapper.find(".category-items"),


        h = $categories[0].scrollHeight + $categories.position().top; // the final height of the legend, according to container height
    console.log('resizeLegend', $categories[0].scrollHeight, $categories.position().top)

    h = Math.min(h, $wrapper.parent().height() - 92);


    if($wrapper.hasClass('opened')) {
      $wrapper.height(h);
    } else {
      $wrapper.css("height", "");
    };
  }


  function toggleLegend(options) {
    var options = $.extend({
      open: 'toggle'
    }, options);
    console.log(options.open)
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
      filter.values
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
  setTimeout(function() {
    getData(embed.params.view, embed.params.id, function(data) {
      embed.data = data;

      // enrich slide with contextual elements
      for(var i=0; i<data.narrative.slides.length; i++) {
        data.narrative.slides[i].meta = {
          total: embed.data.narrative.slides.length,
          index: i+1
        }
      };

      embed.currentSlide = data.narrative.slides[0];

      // Compute node model
      embed.data.categories =
        embed.utils.indexBy((((embed.data.meta || {}).model || {}).node || []), 'id');

      // render legend
      renderLegend();

      // Render first slide
      renderSlide();
    }).fail(function(x, s, m) {
      $('body').empty().text(m);
    });
  }, 0);

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
   * going fullscreen
   */
  $('body').on('click', '*[data-embed-action="fullscreen"]', function() {
    var elem = document.getElementById('fullscreen-container'),
        fullScreen =
          document.isFullScreen ||
          document.msIsFullscreen ||
          document.mozIsFullScreen ||
          document.webkitIsFullScreen;

    if (!fullScreen) {
      $(this).text('exit fullscreen');

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    }
    else {
      $(this).text('fullscreen');

      if (document.cancelFullscreen) {
        document.cancelFullscreen();
      } else if (document.msCancelFullscreen) {
        document.msCancelFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
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

  // close legend
  $('body').on('click', '[data-embed-legend-action="close"]', function() {
    var $wrapper = $('.view-content-wrapper');
    if(!$wrapper.hasClass('show-legend')) {
      toggleLegend({open:false});
    }
  });
  // open/ toggle legend
  $('body').on('click','*[data-embed-legend-action="toggle"]', function() {
    var $wrapper = $('.legend-wrapper');

    if($wrapper.hasClass('active')) { // calculate real height then
      $wrapper.toggleClass('opened');
      resizeLegend();
    };
  });
  // Exporting for convenience
  this.embed = embed;
}).call(this);
