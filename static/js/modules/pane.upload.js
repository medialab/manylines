;(function(undefined) {

  /**
   * TubeMyNet Upload Pane
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

      /**
       * Clicking the button triggers the file input.
       */
      $('a[role="button"]', dom).click(function(e) {
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

        reader.onerror = function(e) {
          self.dispatchEvent('error', {reason: 'upload.error_uploading_file'});
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
