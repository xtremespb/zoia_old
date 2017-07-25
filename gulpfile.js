const gulp = require('gulp');
const concat = require('gulp-concat');
const minifyCSS = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const fs = require('fs');
const path = require('path');

gulp.task('cleanup', async() => {
    fs.unlinkSync(path.join(__dirname, 'static', 'zoia', 'core', 'css', 'panel.min.css'));
    fs.unlinkSync(path.join(__dirname, 'static', 'zoia', 'core', 'js', 'panel.min.js'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'users', 'static', 'css', 'users.min.css'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'users', 'static', 'js', 'users.min.js'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'css', 'login.min.css'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'css', 'register.min.css'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'css', 'resetConfirm.min.css'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'css', 'reset.min.css'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'css', 'registerConfirm.min.css'));
    fs.unlinkSync(path.join(__dirname, 'static', 'zoia', '3rdparty', 'uikit', 'js', 'bundle.min.js'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'js', 'login.min.js'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'js', 'register.min.js'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'js', 'registerConfirm.min.js'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'js', 'reset.min.js'));
    fs.unlinkSync(path.join(__dirname, 'modules', 'auth', 'static', 'js', 'resetConfirm.min.js'));
});

gulp.task('panel', async() => {
    // Generate CSS
    gulp.src(['static/zoia/3rdparty/uikit/css/uikit.min.css', 'static/zoia/3rdparty/perfect-scrollbar/css/perfect-scrollbar.min.css', 'static/zoia/core/css/panel.css'], { base: __dirname })
        .pipe(minifyCSS())
        .pipe(concat('panel.min.css'))
        .pipe(gulp.dest(path.join('static', 'zoia', 'core', 'css')));
    // Generate panel.min.js
    gulp.src(['static/zoia/3rdparty/jquery/jquery.min.js', 'static/zoia/3rdparty/uikit/js/uikit.min.js', 'static/zoia/3rdparty/uikit/js/uikit-icons.min.js', 'static/zoia/3rdparty/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js'], { base: __dirname })
        .pipe(concat('panel.min.js'))
        .pipe(gulp.dest(path.join('static', 'zoia', 'core', 'js')));
});

gulp.task('users', async() => {
    // Generate CSS
    gulp.src(['modules/users/static/css/users.css'], { base: __dirname })
        .pipe(minifyCSS())
        .pipe(concat('users.min.css'))
        .pipe(gulp.dest(path.join('modules', 'users', 'static', 'css')));
    // Generate users.min.js
    gulp.src(['static/zoia/core/js/jquery.zoiaFormBuilder.js', 'static/zoia/core/js/jquery.zoiaTable.js', 'modules/users/static/js/users.js'], { base: __dirname })
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('users.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.join('modules', 'users', 'static', 'js')));
});

gulp.task('auth', async() => {
    // Generate CSS
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/3rdparty/uikit/css/uikit.min.css', 'modules/auth/static/css/login.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('login.min.css'))
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'css')))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['modules/auth/static/css/register.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('register.min.css'))
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'css')))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['modules/auth/static/css/resetConfirm.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('resetConfirm.min.css'))
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'css')))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['modules/auth/static/css/reset.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('reset.min.css'))
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'css')))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['modules/auth/static/css/registerConfirm.css'], { base: __dirname })
            .pipe(minifyCSS())
            .pipe(concat('registerConfirm.min.css'))
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'css')))
            .on('end', resolve);
    });
    // Generate JS bundle for UIkit
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/3rdparty/jquery/jquery.min.js', 'static/zoia/3rdparty/uikit/js/uikit.min.js', 'static/zoia/3rdparty/uikit/js/uikit-icons.min.js'], { base: __dirname })
            .pipe(concat('bundle.min.js'))
            .pipe(gulp.dest(path.join('static', 'zoia', '3rdparty', 'uikit', 'js')))
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
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'js')))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/3rdparty/uikit/js/bundle.min.js', 'modules/auth/static/js/login'], { base: __dirname })
            .pipe(concat('login.min.js'))
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'js')))
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
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'js')))
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
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'js')))
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
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'js')))
            .on('end', resolve);
    });
    await new Promise((resolve, reject) => {
        gulp.src(['static/zoia/3rdparty/uikit/js/bundle.min.js', 'modules/auth/static/js/reset'], { base: __dirname })
            .pipe(concat('reset.min.js'))
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'js')))
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
            .pipe(gulp.dest(path.join('modules', 'auth', 'static', 'js')))
            .on('end', resolve);
    });
});