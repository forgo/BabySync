'use strict';

var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    bcrypt = require('co-bcrypt'), // https://github.com/sindresorhus/gulp-mocha/issues/86
    // - fixes issue where 2nd run of 'mocha' on watch causes
    //   "Module did not self-register" error in 'gulp-mocha-co'
    mocha = require('gulp-mocha-co'),
    exit = require('gulp-exit'),
    watch = require('gulp-watch'),
    gutil = require('gulp-util'),
    spawn = require('child_process').spawn;


gulp.task('clean', function() {
    // Do run some gulp tasks here
    // ...

    // Finally execute your script below - here "ls -lA"
    var child = spawn("./scripts/clean.sh", [], {
            cwd: process.cwd()
        }),
        stdout = '',
        stderr = '';

    child.stdout.setEncoding('utf8');

    child.stdout.on('data', function(data) {
        stdout += data;
        // gutil.log(data);
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function(data) {
        stderr += data;
        gutil.log(gutil.colors.red(data));
        gutil.beep();
    });

    child.on('close', function(code) {
        gutil.log("Done with exit code", code);
        if (stdout) { gutil.log("OUTPUT: ", stdout); }
        if (stderr) { gutil.log("ERRORS: ", stderr); }
    });
});

gulp.task('nodemon', function() {
    nodemon({
        verbose: 'true',
        script: 'server.js',
        env: {
            'NODE_ENV': 'development',
            'PORT': 8111
        },
        nodeArgs: ['--debug=9111', '--harmony']
    }).on('restart');
});

gulp.task('watch', function() {
    gulp.watch(
        ['*.js', 'v1/**/*.js'], // files to watch
        {
            read: true
        }, [''] // Commenting out until makes more sense ['mocha'] // tasks to run when above files change
    )
});

gulp.task('mocha', function() {

    // Forcing a 1 second delay in mocha task to clean up  async console messages.
    setTimeout(
        function() {

            process.env.NODE_ENV = 'test';
            process.env.PORT = 8111;
            gulp.src(['v1/test/test_*.js'])
                .pipe(mocha({
                    reporter: 'spec'
                }))
                .on('error', function(err) {
                    console.log("gulp 'mocha' task error: ", err.toString());
                    this.emit('end'); // Gracefully continue without exiting process if test fails
                });
        },
        2000);
});

gulp.task('test-once', function() {
    gulp.tasks.mocha.fn().pipe(exit());
});

// Commenting 'mocha' task out on default start out to speed up developement
// until it makes more sense
//gulp.task('default', ['nodemon', 'mocha', 'watch']);

gulp.task('default', ['nodemon']);