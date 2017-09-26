var gulp = require('gulp');
var jsdoc = require('gulp-jsdoc3');

gulp.task('watch', function() {
    gulp.watch(['README.md', './source/flue/*.js'],['doc']);
  });
  
gulp.task('doc', function (cb) {
    gulp.src(['README.md', './source/flue/*.js'], {read: false})
        .pipe(jsdoc({
            "tags": {
                "allowUnknownTags": true,
                "dictionaries": ["jsdoc"]
            },
            "source": {
                "include": ["source/flue","README.md"],
                "includePattern": ".js$",
                "excludePattern": "(node_modules/|docs)"
            },
            "plugins": [
                "plugins/markdown"
            ],
            "templates": {
                "referenceTitle": "My SDK Name"
            },
            "opts": {
                "destination": "./docs/",
                "encoding": "utf8",
                "private": true,
                "recurse": true,
                "template": "node_modules/minami"
                }
        },cb));
    });

gulp.task('default', ['watch','doc']);
