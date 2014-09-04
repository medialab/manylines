;(function() {
  'use strict';

  /**
   * Classes
   */
  function Narrative(data) {

    // Properties
    this.title = data ? data.title : i18n.t('narratives.default_narrative_title');
    this.slides = [];

    // Methods
    this.addSlide = function(snapshot, data) {
      var slide = new Slide(snapshot, data);
      this.slides.push(slide);
      return slide;
    };
  }

  function Slide(snapshot, data) {

    // Properties
    this.title = data ? data.title : i18n.t('narratives.default_slide_title');
    this.text = data ? data.text : '';
    this.snapshot = snapshot;
  }

  app.pkg('app.modules');
  app.modules.narratives = function(dom, d) {
    var self = this,
        s = d.get('mainSigma'),
        sigmaController;

    /**
     * Properties
     */
    this.snapshotThumbnails = [];
    this.currentNarrative = null;
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
      self.currentNarrative = new Narrative(data);

      // Fetching the template
      app.templates.require('app.narratives.edit', function(template) {

        // Templating the edition view
        $('.main').parent().replaceWith(template(self.currentNarrative));

        // Rendering the snapshots
        self.renderSnapshots();

        // Sortable
        var unchosen = new Sortable(
          $('.unchosen-views-band tr')[0],
          {
            group: 'snapshots',
            draggable: 'td',
            filter: '.no-drag'
          }
        );

        var chosen = new Sortable(
          $('.chosen-views-band tr')[0],
          {
            group: 'snapshots',
            draggable: 'td',
            filter: '.no-drag',
            onAdd: function(e) {
              var snapshot = $(e.item).find('.view-thumbnail').attr('data-app-thumbnail-snapshot');

              // Adding a slide
              self.currentSlide = self.currentNarrative.addSlide(snapshot);

              // Rendering
              slide(self.currentSlide);
            }
          }
        );
      });
    }

    function slide(data) {
      app.templates.require('app.narratives.slide', function(template) {
        $('.slide-container').empty().append(template({
          slide: data,
          placeholder: i18n.t('narratives.default_slide_text')
        }));
        var sigmaController = new app.utils.sigmaController('narratives.slide', $('.slide-container'), d);
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
      if (!self.currentNarrative)
        return;

      var prop = $(this).attr('data-app-narratives-editable');

      var responses = {
        title: function() {
          self.currentNarrative.title = $(this).val().trim();
        },
        slide_title: function() {
          self.currentSlide.title = $(this).val().trim();
        },
        slide_text: function() {
          self.currentSlide.text = $(this).val().trim();
        }
      };

      responses[prop] && responses[prop].call(this);
      console.log(self.currentSlide);
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

    this.reinitialize = function() {

      // Resetting model
      this.currentNarrative = null;
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
    menu();
  };
}).call(this);
