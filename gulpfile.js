'use strict';

const gulp        = require('gulp');
const sass        = require('gulp-sass');
const nodemon     = require('gulp-nodemon');
const browserSync = require('browser-sync');
const reload      = browserSync.reload;
const pkg         = require('./package.json');

gulp.task('nodemon', function (cb) {

  var started = false;

  return nodemon({
    script : 'server.js',
    args: ['-dev']
  }).on('start', function () {
    if (!started) {
      cb();
      started = true;
    }
  });
})

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    proxy : 'http://localhost:3000',
    files : ['./public/**/*.*'],
    browser : 'google chrome',
    cors: true,
    port : 3001
  });
});

gulp.task('sass', function () {
  return gulp.src('./scss/**/*.scss')
      .pipe(sass({
        errLogToConsole : true,
        sourceComments : true,
      }).on('error', sass.logError))
      .pipe(gulp.dest('./public/css/'))
      .pipe(reload({ stream : true }));
});

gulp.task('watch', function () {
  gulp.watch('./scss/**/*.scss', ['sass']);
  gulp.watch('./public/**/*.*').on('change', reload);
});

gulp.task('default', ['watch', 'sass', 'browser-sync']);