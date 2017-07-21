const gulp = require('gulp');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const fs = require('fs');
const path = require('path');

gulp.task('auth', async() => {
	// Generate CSS
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/3rdparty/uikit/css/uikit.min.css', 'modules/auth/static/css/login.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('login.min.css'))
            .pipe(gulp.dest('modules/auth/static/css/'))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['modules/auth/static/css/register.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('register.min.css'))
            .pipe(gulp.dest('modules/auth/static/css/'))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['modules/auth/static/css/resetConfirm.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('resetConfirm.min.css'))
            .pipe(gulp.dest('modules/auth/static/css/'))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['modules/auth/static/css/reset.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('reset.min.css'))
            .pipe(gulp.dest('modules/auth/static/css/'))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['modules/auth/static/css/registerConfirm.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('registerConfirm.min.css'))
            .pipe(gulp.dest('modules/auth/static/css/'))
            .on('end', resolve);
    });
    // Generate JS bundle for UIkit
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/3rdparty/jquery/jquery.min.js', 'static/3rdparty/uikit/js/uikit.min.js', 'static/zoia/3rdparty/uikit/js/uikit-icons.min.js'], { base: __dirname })
            .pipe(concat('bundle.min.js'))
            .pipe(gulp.dest('static/zoia/3rdparty/uikit/js/'))
            .on('end', resolve);
    });
    // Generate login.min.js
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/core/js/jquery.zoiaFormBuilder.js', 'modules/auth/static/js/login.js'], { base: __dirname })
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(concat('login'))
            .pipe(uglify())
            .pipe(gulp.dest('modules/auth/static/js/'))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/3rdparty/uikit/js/bundle.min.js', 'modules/auth/static/js/login'], { base: __dirname })
            .pipe(concat('login.min.js'))
            .pipe(gulp.dest('modules/auth/static/js/'))
            .on('end', resolve);
    });
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'js', 'login'));
    // Generate register.min.js
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/core/js/jquery.zoiaFormBuilder.js', 'modules/auth/static/js/register.js'], { base: __dirname })
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(concat('register'))
            .pipe(uglify())
            .pipe(gulp.dest('modules/auth/static/js/'))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/3rdparty/uikit/js/bundle.min.js', 'modules/auth/static/js/register'], { base: __dirname })
            .pipe(concat('register.min.js'))
            .pipe(gulp.dest('modules/auth/static/js/'))
            .on('end', resolve);
    });
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'js', 'register'));
    // Generate registerConfirm.min.js
    await new Promise((resolve, reject) => {
        gulp.src('modules/auth/static/js/registerConfirm.js')
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(concat('registerConfirm.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('modules/auth/static/js/'))
            .on('end', resolve);
    });
    // Generate reset.min.js
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/core/js/jquery.zoiaFormBuilder.js', 'modules/auth/static/js/reset.js'], { base: __dirname })
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(concat('reset'))
            .pipe(uglify())
            .pipe(gulp.dest('modules/auth/static/js/'))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/3rdparty/uikit/js/bundle.min.js', 'modules/auth/static/js/reset'], { base: __dirname })
            .pipe(concat('reset.min.js'))
            .pipe(gulp.dest('modules/auth/static/js/'))
            .on('end', resolve);
    });
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'js', 'reset'));
    // Generate resetConfirm.min.js
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/core/js/jquery.zoiaFormBuilder.js', 'modules/auth/static/js/resetConfirm.js'], { base: __dirname })
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(concat('resetConfirm.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('modules/auth/static/js/'))
            .on('end', resolve);
    });
});