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
              content = e.target.result;

          // Check that the graph is a valid JSON file:
          try {
            data = JSON.parse(content);
          } catch (err) {
            tbn.danger(i18n.t('upload.invalid_JSON_file'));
          }

          // Check that the file is well structured:
          // TODO

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
