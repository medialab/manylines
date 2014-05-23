;(function() {
  'use strict';

  app.pkg('app.modules');
  app.modules.upload = function(dom) {
    var self = this;

    $('a[role="button"]', dom).click(function() {
      $('input:file', dom).click();
    });

    $('input:file', dom).change(function() {
      var reader,
          file = $(this)[0].files[0];

      if (file) {
        reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function(e) {
          var data = {},
              content = e.target.result,
              extension = file.name.split('.').pop().toLowerCase();

          switch (extension) {
            case 'json':
              // The JSON parser is currently disabled, since the attributes
              // are not properly defined in the current format, and they are
              // required for some features:
              break;

              // Former code:
              try {
                data.graph = JSON.parse(content);
              } catch (err) {
                app.danger(i18n.t('upload.invalid_JSON_file'));
              }
              break;
            case 'gexf':
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
              break;
            default:
              app.danger(i18n.t('upload.invalid_file_format'));
          }

          // If we have valid data, let's update:
          if (Object.keys(data).length)
            self.dispatchEvent('graphUploaded', data);
        };
        reader.onerror = function(e) {
          app.danger(i18n.t('upload.error_uploading_file'));
        };
      }
    });
  };
}).call(this);
