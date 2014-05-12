var findit = require('findit');
module.exports = function(grunt) {
  var imports = require('./imports.json');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    handlebars: {
      compile: {
        options: {
          namespace: 'tbn.templates.preloaded',
          processName: function(str) {
            return str.replace(/^static/, '');
          }
        },
        files: {
          'static/dist/templates.js': 'static/templates/*.handlebars'
        }
      }
    },
    uglify: {
      options: {
        banner: '/* tubemy.net - <%= pkg.description %> - Version: <%= pkg.version %> */\n'
      },
      prod: {
        files: {
          'static/dist/tbn.min.js': imports.js.map(function(path) {
            return 'static' + path;
          }).concat('static/dist/templates.js')
        }
      }
    },
    cssmin: {
      minify: {
        src: 'static/css/*.css',
        dest: 'static/dist/tbn.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // By default, will check lint, test and minify:
  grunt.registerTask('default', ['handlebars', 'uglify', 'cssmin']);
};
;
