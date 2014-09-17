;(function() {
  'use strict';

  /**
   * Classes
   */
  function Narrative(data) {

    // Properties
    this.title = data ? data.title : i18n.t('narratives.default_narrative_title');
    this.slides = [];
    this.isNew = false;

    // Methods
    this.addSlide = function(snapshot, data) {
      var slide = new Slide(snapshot, data);
      this.slides.push(slide);
      return slide;
    };

    this.getSlide = function(snapshot) {
      return app.utils.first(this.slides, function(s) {
        return s.snapshot === snapshot;
      });
    };

    this.removeSlide = function(snapshot) {
      this.slides = this.slides.filter(function(s) {
        return s.snapshot !== snapshot;
      });
    };

    this.orderSlides = function(order) {
      var na = [];

      order.forEach(function(snapshot) {
        na.push(this.getSlide(snapshot));
      }, this);

      this.slides = na;

      return this;
    };

    this.export = function() {
      return {
        title: this.title,
        slides: this.slides.map(function(s) { return s.export(); })
      };
    };
  }

  function Slide(snapshot, data) {

    // Properties
    this.title = data ? data.title : i18n.t('narratives.default_slide_title');
    this.text = data ? data.text : '';
    this.snapshot = snapshot;

    // Methods
    this.export = function() {
      return {
        title: this.title,
        text: this.text,
        snapshot: this.snapshot
      };
    };
  }

  // Persistent data
  // TODO: clear this dirty trick for god's sake.
  var currentNarrative = null;

  app.pkg('app.modules');
  app.modules.narratives = function(dom, d) {
    var self = this,
        s = d.get('mainSigma'),
        sigmaController;

    /**
     * Properties
     */
    this.sigmaController = null;
    this.snapshotThumbnails = [];
    this.currentSlide = null;

    /**
     * Layout
     */
    function menu() {
      self.reinitialize();

      // Here we should fetch the narratives somehow
      // TODO: domino data binding
      var fakeList = [];

      contra.concurrent({
        menu: function(next) {
          app.templates.require('app.narratives.menu', function(t) {
            next(null, t);
          });
        },
        list: function(next) {
          app.templates.require('app.narratives.items', function(t) {
            next(null, t);
          });
        },
        controls: function(next) {
          app.templates.require('app.narratives.addItem', function(t) {
            next(null, t);
          });
        }
      }, function(err, templates) {
        $('.main').parent().replaceWith(templates.menu());

        // Templating the menu
        var $list = $('.narratives-list');
        $list.append(templates.list({narratives: fakeList}));
        $list.append(templates.controls());
      });
    }

    function edition(data) {

      // Setting the current narrative
      if (!(data instanceof Narrative))
        currentNarrative = new Narrative(data);

      // Fetching the template
      app.templates.require('app.narratives.edit', function(template) {

        // Templating the edition view
        $('.main').parent().replaceWith(template(currentNarrative));

        // Rendering the snapshots
        self.renderSnapshots();

        // Sortable
        var unchosen = new Sortable(
          $('.unchosen-views-band tr')[0],
          {
            group: 'snapshots',
            draggable: 'td',
            filter: '.no-drag',
            ghostClass: 'drag-ghost'
          }
        );

        var chosen = new Sortable(
          $('.chosen-views-band tr')[0],
          {
            group: 'snapshots',
            draggable: 'td',
            filter: '.no-drag',
            ghostClass: 'drag-ghost',
            onAdd: function(e) {
              var snapshot = $(e.item).find('.view-thumbnail').attr('data-app-thumbnail-snapshot');

              // Adding a slide
              self.currentSlide = currentNarrative.addSlide(snapshot);

              // Rendering
              slide(self.currentSlide);
            },
            onRemove: function(e) {
              var snapshot = $(e.item).find('.view-thumbnail').attr('data-app-thumbnail-snapshot');

              // Deactivating
              $(e.item).children().removeClass('active');

              // Removing a slide
              currentNarrative.removeSlide(snapshot);

              // Do we need to clean the rendered slide?
              if (self.currentSlide.snapshot === snapshot) {
                $('.slide-container').empty();
                self.currentSlide = null;
              }
            },
            onUpdate: function(e) {

              // Retrieving slide order
              var order = $('.chosen-views-band [data-app-thumbnail-snapshot]').get().map(function(e) {
                return $(e).attr('data-app-thumbnail-snapshot');
              });

              // Impacting model
              currentNarrative.orderSlides(order);
            }
          }
        );
      });
    }

    function slide(data) {

      // Reinitialize sigma
      self.reinitializeSigma();

      app.templates.require('app.narratives.slide', function(template) {

        // Templating
        $('.slide-container').empty().append(template({
          slide: data,
          placeholder: i18n.t('narratives.default_slide_text')
        }));

        // Activating
        // TODO: dirty, find a more elegant way
        $('.view-thumbnail').parent().removeClass('active');
        $('[data-app-thumbnail-snapshot="' + data.snapshot + '"]').parent().addClass('active');

        // Controlling sigma
        self.sigmaController = new app.utils.sigmaController('narratives.slide', $('.slide-container'), d);

        // Retrieving snapshot info
        var snapshot = app.utils.first(d.get('snapshots'), function(s) {
          return s.id === data.snapshot;
        });

        // Camera
        s.cameras.mainCamera.goTo({
          ratio: snapshot.view.camera.ratio,
          x: (snapshot.view.camera.x * s.renderers.mainRenderer.width) / 100,
          y: (snapshot.view.camera.y * s.renderers.mainRenderer.height) / 100
        });

        // Color filter
        var category = app.utils.first((d.get('meta') || {}).model.node, function(c) {
          return c.id === snapshot.filters[0].category;
        });

        s.mapColors(category);

        s.refresh();
      });
    }

    /**
     * General bindings
     */

    // Clicking on the back to narratives button
    $('body').on('click', '[data-app-narratives-action]', function() {
      var action = $(this).attr('data-app-narratives-action');

      var responses = {
        add: function() {
          edition();
        },
        edit: function() {
          edition();
        },
        back: function() {
          menu();
        }
      };

      responses[action] && responses[action]();
    });

    // Inline editors
    $('body').on('change', '[data-app-narratives-editable]', function() {
      if (!currentNarrative)
        return;

      var prop = $(this).attr('data-app-narratives-editable');

      var responses = {
        title: function() {
          currentNarrative.title = $(this).val().trim();
        },
        slide_title: function() {
          self.currentSlide.title = $(this).val().trim();
        },
        slide_text: function() {
          self.currentSlide.text = $(this).val().trim();
        }
      };

      responses[prop] && responses[prop].call(this);
    });

    // Switching slides
    $('body').on('click', '.chosen-views-band [data-app-thumbnail-snapshot]', function() {
      if ($(this).parent().hasClass('active'))
        return;

      self.currentSlide = currentNarrative.getSlide($(this).attr('data-app-thumbnail-snapshot'));

      // Rendering
      slide(self.currentSlide);
    });

    /**
     * Methods
     */
    this.renderSnapshots = function() {
      var snapshots = d.get('snapshots'),
          meta = d.get('meta');

      if (!snapshots)
        return;

      app.templates.require('app.misc.snapshots', function(snapshotTemplate) {

        $('.unchosen-views-band tr').empty().append(
          snapshotTemplate({snapshots: snapshots})
        );

        // Creating ghost td to fix Sortable behaviour
        // TODO: fix this hack
        var fix = '<td class="no-drag" style="width:1px;height:90px;"></td>';
        $('.chosen-views-band tr, .unchosen-views-band tr').prepend(fix);

        // Killing thumbnails
        self.snapshotThumbnails.forEach(function(t) {
          t.kill();
        });

        self.snapshotThumbnails = [];

        // Creating thumbnails
        snapshots.forEach(function(snapshot, i) {
          var c = app.utils.first(meta.model.node, function(c) {
            return c.id === snapshot.filters[0].category;
          });

          self.snapshotThumbnails.push(
            $('[data-app-thumbnail-snapshot="' + snapshot.id + '"].view-thumbnail').thumbnail(s, {
              category: c,
              filter: snapshot.filters[0].values,
              camera: snapshot.view.camera
            })
          );
        });

        // Refreshing sigma
        s.refresh();

        // Refreshing thumbnails
        self.snapshotThumbnails.forEach(function(t) {
          t.refresh();
        });
      });
    };

    this.reinitializeSigma = function() {
      if (!this.sigmaController)
        return;

      this.sigmaController = null;
    };

    this.reinitialize = function() {

      // Resetting model
      this.currentSlide = null;

      // Killing thumbnails
      this.snapshotThumbnails.forEach(function(t) {
        t.kill();
      });
    };

    this.kill = this.reinitialize;

    /**
     * Module Initialization
     */
    if (currentNarrative)
      edition(currentNarrative);
    else
      menu();
  };
}).call(this);
