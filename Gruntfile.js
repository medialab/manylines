module.exports = function(grunt) {
  var imports = require('./imports.json');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    handlebars: {
      app: {
        options: {
          namespace: 'app.templates.preloaded',
          processName: function(str) {
            return str.replace(/^static/, '');
          }
        },
        files: {
          'static/dist/app.templates.js': 'static/templates/*.handlebars'
        }
      }
    },
    uglify: {
      options: {
        banner: '/* tubemy.net - <%= pkg.description %> - Version: <%= pkg.version %> */\n'
      },
      app: {
        files: {
          'static/dist/app.min.js': imports.app.js.map(function(path) {
            return 'static' + path;
          }).concat('static/dist/app.templates.js')
        }
      },
      embed: {
        files: {
          'static/dist/embed.min.js': imports.embed.js.map(function(path) {
            return 'static' + path;
          })
        }
      }
    },
    cssmin: {
      app: {
        src: imports.app.css.map(function(path) {
          return 'static' + path;
        }),
        dest: 'static/dist/app.min.css'
      },
      embed: {
        src: imports.embed.css.map(function(path) {
          return 'static' + path;
        }),
        dest: 'static/dist/embed.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // By default, will check lint, test and minify:
  grunt.registerTask('default', ['handlebars', 'uglify', 'cssmin']);
};
