var findit = require('findit');
module.exports = function(grunt) {
  var imports = require('./imports.json');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    handlebars: {
      compile: {
        options: {
          namespace: 'tbn.templates.preloaded'
        },
        files: {
          'public/dist/templates.js': 'public/templates/*.handlebars'
        }
      }
    },
    uglify: {
      options: {
        banner: '/* tubemy.net - <%= pkg.description %> - Version: <%= pkg.version %> */\n'
      },
      prod: {
        files: {
          'public/dist/tbn.min.js': imports.js.map(function(path) {
            return 'public' + path;
          })
        }
      }
    },
    cssmin: {
      minify: {
        src: 'public/css/*.css',
        dest: 'public/dist/tbn.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // By default, will check lint, test and minify:
  grunt.registerTask('default', ['handlebars', 'uglify', 'cssmin']);
};
