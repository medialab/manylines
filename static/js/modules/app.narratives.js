;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.narratives = function(dom, d) {
    var self = this;

    /**
     * Layout
     */
    function menu() {

      // Here we should fetch the narratives somehow
      // TODO: domino data binding
      var fakeList = [
        {
          title: 'Narrative #1'
        },
        {
          title: 'Narrative #2'
        }
      ];

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

    function edition() {

      // Fetching the template
      app.templates.require('app.narratives.edit', function(template) {

        // Templating the edition view
        $('.main').parent().replaceWith(template());
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
          console.log('add');
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
    this.kill = function() {

    };

    /**
     * Module Initialization
     */
    menu();
  };
}).call(this);
