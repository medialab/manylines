var gulp = require('gulp'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify');

var dist = './static/dist',
    imports = require('./imports.json');

// Helpers
function prependStatic(p) {
  return './static/' + p;
}

// Building
gulp.task('app.js.build', function() {

  // Js
  return gulp.src(imports.app.js.map(prependStatic))
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dist));
});

gulp.task('app.css.build', function() {

  // Css
  return gulp.src(imports.app.css.map(prependStatic))
    .pipe(concat('app.min.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(dist));
});

gulp.task('embed.js.build', function() {

  // Js
  return gulp.src(imports.embed.js.map(prependStatic))
    .pipe(concat('embed.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dist));
});

gulp.task('embed.css.build', function() {

  // Css
  return gulp.src(imports.embed.css.map(prependStatic))
    .pipe(concat('embed.min.css'))
    .pipe(cssmin())
    .pipe(gulp.dest(dist));
});


// Macro-tasks
gulp.task('default', [
  'app.js.build',
  'app.css.build',
  'embed.js.build',
  'embed.css.build'
]);
