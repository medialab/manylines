;(function() {
  'use strict';

  /**
   * Classes
   */
  function Narrative() {

    // Properties
    this.title = '';
    this.slides = [];
  }

  function Slide() {

    // Properties
    this.title = '';
    this.text = '';
    this.snapshot = '';
  }

  app.pkg('app.modules');
  app.modules.narratives = function(dom, d) {
    var self = this,
        s = d.get('mainSigma');

    /**
     * Properties
     */
    this.snapshotThumbnails = [];
    this.currentNarrative = null;

    /**
     * Layout
     */
    function menu() {
      self.kill();

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

      // Dummy object if we want to create a narrative
      if (data === true)
        data = {title: 'New Narrative', slides: []};

      // Fetching the template
      app.templates.require('app.narratives.edit', function(template) {

        // Templating the edition view
        $('.main').parent().replaceWith(template(data));

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
            onAdd: function() {
              slide();
            }
          }
        );
      });
    }

    function slide(data) {
      app.templates.require('app.narratives.slide', function(template) {
        $('.slide-container').empty().append(template(data));
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
          edition(true);
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
            $('[data-app-thumbnail-snapshot="' + i + '"].view-thumbnail').thumbnail(s, {
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

    this.kill = function() {
      this.snapshotThumbnails.forEach(function(t) {
        t.kill();
      });
    };

    /**
     * Module Initialization
     */
    menu();
  };
}).call(this);
