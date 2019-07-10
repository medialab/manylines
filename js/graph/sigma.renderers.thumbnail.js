;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize packages:
  sigma.utils.pkg('sigma.renderers');

  // Persistent state
  var staticId = 'Thumbnail',
      counter = 0;

  /**
   * This function is the constructor of the canvas sigma's renderer.
   *
   * @param  {sigma.classes.graph}            graph    The graph to render.
   * @param  {sigma.classes.camera}           camera   The camera.
   * @param  {configurable}           settings The sigma instance settings
   *                                           function.
   * @param  {object}                 object   The options object.
   * @return {sigma.renderers.thumbnail}          The renderer instance.
   */
  sigma.renderers.thumbnail = function(graph, camera, settings, options) {
    if (typeof options !== 'object')
      throw 'sigma.renderers.thumbnail: Wrong arguments.';

    if (!(options.container instanceof HTMLElement))
      throw 'Container not found.';

    var k,
        i,
        l,
        a,
        fn,
        self = this;

    sigma.classes.dispatcher.extend(this);

    // Initialize main attributes:
    this.graph = graph;
    this.camera = camera;
    this.contexts = {};
    this.domElements = {};
    this.options = options;
    this.container = this.options.container;
    this.settings = (
        typeof options.settings === 'object' &&
        options.settings
      ) ?
        settings.embedObjects(options.settings) :
        settings;

    // Thumbnail specific attributes
    this.filter = options.data.filter;
    this.category = options.data.category;
    this.values = options.data.values;

    // Find the prefix:
    if(options.data.camera)
      this.options.prefix = 'renderer' + staticId + (counter++) + ':';
    else
      this.options.prefix = 'renderer' + staticId + ':';

    // Initialize the DOM elements:
    this.initDOM('canvas', 'scene');
    this.contexts.nodes = this.contexts.scene;

    // Bind resize:
    // TODO: somewhat the container width and height is 0 forcing a central n
    window.addEventListener(
      'resize',
      this.boundResize = function() {
        this.resize();
        this.render({process: true});
      }.bind(this),
      false
    );

    this.resize(false);
  };




  /**
   * This method renders the graph on the canvases.
   *
   * @param  {?object}                options Eventually an object of options.
   * @return {sigma.renderers.thumbnail}         Returns the instance itself.
   */
  sigma.renderers.thumbnail.prototype.render = function(options) {
    options = options || {};

    // We render only if really needed
    if (!options.process)
      return this;

    var a,
        i,
        l,
        graph = this.graph,
        nodes = this.graph.nodes,
        prefix = this.options.prefix || '';

    // Apply the camera's view:
    this.camera.applyView(
      undefined,
      this.options.prefix,
      {
        width: this.width,
        height: this.height
      }
    );

    // Clear canvases:
    this.clear();

    // Draw nodes:
    for (a = nodes(), i = 0, l = a.length; i < l; i++) {

      // We draw the node if its filter is correct
      if (!this.filter ||
          (this.filter && ~this.filter.indexOf(a[i].attributes[this.category.id]) ||
           this.filter.length === 0)) {

        this.contexts.nodes.fillStyle = this.values[a[i].attributes[this.category.id]] ||
          (a[i].original || {}).color || a[i].color || this.settings('defaultNodeColor');
        this.contexts.nodes.beginPath();
        this.contexts.nodes.arc(
          // WARNING:
          // The translation has to be here.
          a[i][prefix + 'x'],
          a[i][prefix + 'y'],
          Math.max(a[i][prefix + 'size'] / 6, 1),
          0,
          Math.PI * 2,
          true
        );

        this.contexts.nodes.closePath();
        this.contexts.nodes.fill();
      }
    }

    this.dispatchEvent('render');

    return this;
  };

  /**
   * This method creates a DOM element of the specified type, switches its
   * position to "absolute", references it to the domElements attribute, and
   * finally appends it to the container.
   *
   * @param  {string} tag The label tag.
   * @param  {string} id  The id of the element (to store it in "domElements").
   */
  sigma.renderers.thumbnail.prototype.initDOM = function(tag, id) {
    var dom = document.createElement(tag);

    dom.style.position = 'absolute';
    dom.setAttribute('class', 'sigma-' + id);

    this.domElements[id] = dom;
    this.container.appendChild(dom);

    if (tag.toLowerCase() === 'canvas')
      this.contexts[id] = dom.getContext('2d');
  };

  /**
   * This method resizes each DOM elements in the container and stores the new
   * dimensions. Then, it renders the graph.
   *
   * @param  {?number}                width  The new width of the container.
   * @param  {?number}                height The new height of the container.
   * @return {sigma.renderers.thumbnail}        Returns the instance itself.
   */
  sigma.renderers.thumbnail.prototype.resize = function(w, h) {
    var k,
        oldWidth = this.width,
        oldHeight = this.height,
        pixelRatio = 1;
        // TODO:
        // *****
        // This pixelRatio is the solution to display with the good definition
        // on canvases on Retina displays (ie oversampling). Unfortunately, it
        // has a huge performance cost...
        //  > pixelRatio = window.devicePixelRatio || 1;

    if (w !== undefined && h !== undefined) {
      this.width = w;
      this.height = h;
    } else {
      this.width = this.container.offsetWidth;
      this.height = this.container.offsetHeight;

      w = this.width;
      h = this.height;
    }

    if (oldWidth !== this.width || oldHeight !== this.height) {
      for (k in this.domElements) {
        this.domElements[k].style.width = w + 'px';
        this.domElements[k].style.height = h + 'px';

        if (this.domElements[k].tagName.toLowerCase() === 'canvas') {
          this.domElements[k].setAttribute('width', (w * pixelRatio) + 'px');
          this.domElements[k].setAttribute('height', (h * pixelRatio) + 'px');

          if (pixelRatio !== 1)
            this.contexts[k].scale(pixelRatio, pixelRatio);
        }
      }
    }

    return this;
  };

  /**
   * This method clears each canvas.
   *
   * @return {sigma.renderers.thumbnail} Returns the instance itself.
   */
  sigma.renderers.thumbnail.prototype.clear = function() {
    var k;

    for (k in this.domElements)
      if (this.domElements[k].tagName === 'CANVAS')
        this.domElements[k].width = this.domElements[k].width;

    return this;
  };

  /**
   * This method kills contexts and other attributes.
   */
  sigma.renderers.thumbnail.prototype.kill = function() {
    var k;

    // Unbind resize:
    window.removeEventListener('resize', this.boundResize);

    // Kill contexts:
    for (k in this.domElements) {
      this.domElements[k].parentNode.removeChild(this.domElements[k]);
      delete this.domElements[k];
      delete this.contexts[k];
    }
    delete this.domElements;
    delete this.contexts;
  };
}).call(this);
