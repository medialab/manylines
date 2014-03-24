;(function() {
  'use strict';

  tbn.pkg('tbn.modules');
  tbn.modules.upload = function(dom) {
    var self = this;

    $('input:file').change(function() {
      var reader,
          file = $(this)[0].files[0];

      if (file) {
        reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function(e) {
          var data,
              content = e.target.result,
              extension = file.name.split('.').pop().toLowerCase();

          switch (extension) {
            case 'json':
              try {
                data = JSON.parse(content);
              } catch (err) {
                tbn.danger(i18n.t('upload.invalid_JSON_file'));
              }
              break;
            case 'gexf':
              try {
                sigma.parsers.gexf(
                  (new DOMParser()).parseFromString(content, 'application/xml'),
                  function(gexf) {
                    // Remove metadata from GEXF:
                    data = {
                      nodes: gexf.nodes,
                      edges: gexf.edges
                    };
                  }
                );
              } catch (err) {
                tbn.danger(i18n.t('upload.invalid_GEXF_file'));
              }
          }

          // If we have valid data, let's update:
          if (data)
            self.dispatchEvent('graphUploaded', {
              graph: data
            });
        };
        reader.onerror = function(e) {
          tbn.danger(i18n.t('upload.error_uploading_file'));
        };
      }
    });
  };
}).call(this);
