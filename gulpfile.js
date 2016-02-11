/*eslint-env node */

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create(),
	eslint = require('gulp-eslint'),
	jasmine = require('gulp-jasmine-phantom'),
	inject = require('gulp-inject'),
	replace = require('gulp-replace'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	angularFilesort = require('gulp-angular-filesort');

gulp.task('default', ['copy-js-dev', 'copy-html', 'copy-index-dev', 'copy-images', 'styles', 'fonts', 'lint'], function() {
	gulp.watch('app/assets/sass/**/*.scss', ['styles']);
	gulp.watch(['app/app.js', 'app/**/*.js'], ['lint', 'copy-js-dev']);
	gulp.watch('app/*/**/*.html', ['copy-html']);
	gulp.watch('app/index.html', ['copy-index-dev']);
	gulp.watch('dist/**/*.html').on('change', browserSync.reload);

	browserSync.init({
		server: 'dist',
	});
});

// Build app to app/dist in production-ready state
gulp.task('dist', ['js-dist', 'copy-html', 'copy-index', 'copy-images', 'fonts', 'styles']);

// Concatenate and uglify app JS; place in dist/js
gulp.task('js-dist', ['copy-js'], function() {
	gulp.src('app/**/*.js')
		.pipe(concat('eventplanner.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

// Run ESLint on any changes to app JS
gulp.task('lint', function() {
	return gulp.src('app/**/*.js')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

// Inject locally-hosted third-party JS (e.g. Angular) into index.html
gulp.task('copy-index-dev', ['copy-js-dev'], function() {
	gulp.src('app/index.html')
		.pipe(replace(/<!-- dev_only ([\s\S]*?)-->/g, '$1'))
		.pipe(inject(gulp.src('dist/js/lib/*.js').pipe(angularFilesort()), {
			ignorePath: '/dist/',
			addRootSlash: false
		}))
		.pipe(gulp.dest('dist'));
});

// Add production-only CDN-hosted third-party JS to index.html and copy to dist
// Also inject any third party JS from dist/js/lib
gulp.task('copy-index', ['copy-js'], function() {
	gulp.src('app/index.html')
		.pipe(replace(/<!-- production_only ([\s\S]*?)-->/g, '$1'))
		.pipe(inject(gulp.src('dist/js/lib/*.js').pipe(angularFilesort()), {
			ignorePath: '/dist/',
			addRootSlash: false
		}))
		.pipe(gulp.dest('dist'));
});

// Copy all non-index .html files to dist
gulp.task('copy-html', function() {
	gulp.src('app/*/**/*.html')
		.pipe(gulp.dest('dist'));
});

// Copy any images to dist/img
gulp.task('copy-images', function() {
	gulp.src('app/assets/img/*')
		.pipe(gulp.dest('dist/img'));
});

// Copy production-ready third-party JS from bower_components into dist/js/lib,
// and concatenate app JS and place in dist/js
//
// Only for use in production
gulp.task('copy-js', function() {
	var thirdPartySources = gulp.src([
		'bower_components/angular-local-storage/dist/angular-local-storage.min.js'
	]);

	return thirdPartySources.pipe(gulp.dest('dist/js/lib'));
});

// Copy third-party JS from bower_components into dist/js/lib, and concatenate 
// app JS and place in dist/js
//
// Not for use in production
gulp.task('copy-js-dev', function() {
	var thirdPartySources = gulp.src([
		'bower_components/angular/angular.js', 
		'bower_components/angular-route/angular-route.js',
		'bower_components/angular-local-storage/dist/angular-local-storage.js'
	]);

	gulp.src('app/**/*.js')
		.pipe(concat('eventplanner.js'))
		.pipe(gulp.dest('dist/js'));

	return thirdPartySources.pipe(gulp.dest('dist/js/lib'));
});

gulp.task('fonts', function() {
	gulp.src('bower_components/bootstrap-sass/assets/fonts/bootstrap/*.*')
		.pipe(gulp.dest('dist/fonts/bootstrap'));
});

// Prepare .scss styles for production (minify, autoprefix) and place in dist
gulp.task('styles', function() {
	gulp.src('app/assets/sass/**/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

// Run Jasmine integration tests in Chrome
gulp.task('tests', function() {
	gulp.src('app/**/*_test.js') // TODO multiple files?
		.pipe(jasmine({
			integration: true,
			vendor: 'app/**/*.js'
		}));
});
