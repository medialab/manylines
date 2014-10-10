;(function(undefined) {

  /**
   * Manylines Upload Pane
   * ======================
   *
   * This module takes care of graph uploading.
   */

  app.panes.upload = function() {
    var self = this;

    // Extending
    Pane.call(this, {name: 'upload'});


    // Emitters
    this.emitters = function(dom) {
      var $button = $('a[role="button"]', dom);

      /**
       * Clicking the button triggers the file input.
       */
      $button.click(function(e) {
        $('input:file', dom).click();

        // Cleaning storage
        self.dispatchEvent('storage.clear');

        e.preventDefault();
      });

      /**
       * Receiving the file and reading it.
       */
      $('input:file', dom).change(function() {
        var file = $(this)[0].files[0];

        if (!file)
          return;

        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');

        reader.onloadstart = function(e) {

          // Feedback
          $button.button('loading');

          // Stopping upload if file is bigger than settings
          if (e.total > app.settings.upload.maxSize) {
            self.dispatchEvent('error', {reason: 'upload.too_big'});
            reader.abort();
          }
        };

        reader.onerror = function(e) {
          if (e.target.error.name !== 'AbortError')
            self.dispatchEvent('error', {reason: 'upload.error_uploading_file'});

          $button.button('reset');
        };

        reader.onload = function(e) {
          var data = {},
              content = e.target.result,
              extension = file.name.split('.').pop().toLowerCase();

          if (extension !== 'gexf')
            return self.dispatchEvent('error', {reason: 'upload.invalid_file_format'});

          // Parsing the graph
          try {
            sigma.parsers.gexf(
              (new DOMParser()).parseFromString(content, 'application/xml'),
              function(gexf) {
                data.meta = gexf.meta;
                data.model = gexf.model;
                data.graph = {
                  nodes: gexf.nodes,
                  edges: gexf.edges
                };
              }
            );
          } catch (err) {
            app.danger(i18n.t('upload.invalid_GEXF_file'));
          }

          // If we have valid data, let's update:
          if (Object.keys(data).length)
            self.dispatchEvent('graph.uploaded', data);
        };
      });
    };
  };
}).call(this);
