;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  if (typeof conrad === 'undefined')
    throw 'conrad is not declared';

  sigma.utils.pkg('sigma.renderers');

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
    this.values = this.options.values;
    this.category = this.options.category;
    this.container = this.options.container;
    this.settings = (
        typeof options.settings === 'object' &&
        options.settings
      ) ?
        settings.embedObjects(options.settings) :
        settings;

    // Initialize the DOM elements:
    this.initDOM('canvas', 'nodes');

    // Bind resize:
    window.addEventListener(
      'resize',
      this.boundResize = this.resize.bind(this),
      false
    );

    this.resize();
  };

  // TODO
  // CANNOT USE RENDER
  // RENDER CALLED BY SIGMA
  // MY LIFE SUCKS
  // FROMAGE
  sigma.renderers.thumbnail.prototype.render = function(options) {};

  sigma.renderers.thumbnail.prototype.doRender = function(options) {
    options = options || {};

    var a,
        i,
        l,
        graph = this.graph,
        nodes = this.graph.nodes,
        prefix = this.options.prefix || '';

    // Clear canvases:
    this.clear();

    // Draw nodes:
    for (a = nodes(), i = 0, l = a.length; i < l; i++) {
      this.contexts.nodes.fillStyle = this.values[a[i].attributes[this.category.id]] ||
        this.settings('defaultNodeColor');
      this.contexts.nodes.beginPath();
      this.contexts.nodes.arc(
        // WARNING:
        // The translation has to be here.
        a[i][prefix + 'x'] + this.width / 2,
        a[i][prefix + 'y'] + this.height / 2,
        a[i][prefix + 'size'] / 2,
        0,
        Math.PI * 2,
        true
      );

      this.contexts.nodes.closePath();
      this.contexts.nodes.fill();
    }

    this.dispatchEvent('render');

    return this;
  };

  sigma.renderers.thumbnail.prototype.initDOM = function(tag, id) {
    var dom = document.createElement(tag);

    dom.style.position = 'absolute';
    dom.setAttribute('class', 'sigma-' + id);

    this.domElements[id] = dom;
    this.container.appendChild(dom);

    if (tag.toLowerCase() === 'canvas')
      this.contexts[id] = dom.getContext('2d');
  };

  sigma.renderers.thumbnail.prototype.resize = function(w, h) {
    var k,
        oldWidth = this.width,
        oldHeight = this.height;

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
          this.domElements[k].setAttribute('width', w + 'px');
          this.domElements[k].setAttribute('height', h + 'px');
        }
      }
    }

    this.doRender();

    return this;
  };

  sigma.renderers.thumbnail.prototype.clear = function() {
    var k;

    for (k in this.domElements)
      if (this.domElements[k].tagName === 'CANVAS')
        this.domElements[k].width = this.domElements[k].width;

    return this;
  };

  sigma.renderers.thumbnail.prototype.kill = function() {
    var k,
        captor;

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
