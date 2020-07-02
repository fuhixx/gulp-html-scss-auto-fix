const gulp = require('gulp');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
// 追加
const htmlhint = require('gulp-htmlhint');
const htmlbeautify = require('gulp-html-beautify');
const glob = require('gulp-sass-glob');
const gulpStylelint = require('gulp-stylelint');
const prettier = require('gulp-prettier');
const csscomb = require('gulp-csscomb');
const cached = require('gulp-cached');
const debug = require('gulp-debug');
const changed = require('gulp-changed');
// 追加終了
const pug = require('gulp-pug');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync');

// setting : htmlbeautify
const htmloptions = {
  indent_char: '',
  indent_size: 1,
  unformatted: ['textarea', 'p', 'pre', 'span', 'a', 'h1', 'h2', 'h3'],
  indent_with_tabs: true,
  max_preserve_newlines: 0,
  wrap_attributes: false,
  wrap_attributes_indent_size: 0,
};

// setting : cssbeautify
// const cssoptions = {
//   indent_char: '',
//   indent_size: 1,
//   max_preserve_newlines: 0,
//   wrap_attributes: false,
//   wrap_attributes_indent_size: 0,
// }

// setting : prettier
const scssoptions = {
  printWidth: 100,
  singleQuote: true,
  useTabs: true,
  tabWidth: 2,
  trailingComma: 'es5',
};

//setting : paths
const paths = {
  root: './dist/',
  src: './src/',
  pugSrc: './src/pug/**/*.pug',
  htmlSrc: './dist/**/*.html',
  scssSrc: './src/scss/**/*.scss',
  // scssはsrcフォルダに格納しますが、Distと書いています
  scssDist: './src/scss',
  cssDist: './dist/css/',
  jsSrc: './src/js/**/*.js',
  jsDist: './dist/js/',
};

//gulpコマンドの省略
const { watch, series, task, src, dest, parallel } = require('gulp');

//HTML
task('html', function () {
  return (
    src(paths.htmlSrc)
      .pipe(
        debug({
          title: 'init: ',
        })
      )
      .pipe(htmlhint())
      .pipe(htmlhint.reporter())
      .pipe(cached('stop this task'))
      // 納品用
      // .pipe(htmlhint.failReporter())
      .pipe(htmlbeautify(htmloptions))
      .pipe(dest(paths.root))
      .pipe(
        notify({
          title: 'Task running Gulp',
          message: 'html file compiled.',
          sound: 'Tink',
        })
      )
      .pipe(cached('stop this task'))
  );
});

//Sass
task('sass', function () {
  return (
    src(paths.scssSrc)
      // .pipe(changed(paths.scssSrc))
      .pipe(
        debug({
          title: 'init: ',
        })
      )
      .pipe(cached('stop this task'))
      .pipe(csscomb())
      .pipe(
        plumber({
          errorHandler: notify.onError('Error: <%= error.message %>'),
        })
      )
      .pipe(
        notify({
          title: 'Task running Gulp',
          message: 'sass success',
          sound: 'Tink',
        })
      )
      .pipe(cached('stop this task'))
      .pipe(prettier({ scssoptions }))
      // SCSSのスタイルリントのエラー表示を使うなら↓
      // .pipe(gulpStylelint({
      //   reporters: [
      //     {formatter: 'string', console: true}
      //   ]
      // }))
      .pipe(cached('stop this task'))
      // デバッグ用
      .pipe(
        debug({
          title: 'init: ',
        })
      )
      // .pipe(
      //     plumber({
      //         errorHandler: notify.onError("Error: <%= error.message %>")
      //     })
      // )
      // デバッグ用
      .pipe(
        debug({
          title: 'init: ',
        })
      )
      .pipe(glob())
      .pipe(dest(paths.scssDist))
      // 追加終了
      .pipe(
        sass({
          // Minifyするなら'compressed'
          outputStyle: 'expanded',
        })
      )
      .pipe(autoprefixer())
      .pipe(cached('stop this task'))
  );
});

//Pug
// task('pug', function () {
//   return src([paths.pugSrc, '!./src/pug/**/_*.pug'])
//     .pipe(
//       plumber({
//         errorHandler: notify.onError('Error: <%= error.message %>'),
//       })
//     )
//     .pipe(
//       pug({
//         pretty: true,
//         basedir: './src/pug',
//       })
//     )
//     .pipe(dest(paths.htmlSrc));
// });

//JS Compress
task('js', function () {
  return src(paths.jsSrc)
    .pipe(plumber())
    .pipe(uglify())
    .pipe(dest(paths.jsDist));
});

// browser-sync
task('browser-sync', () => {
  return browserSync.init({
    server: {
      baseDir: paths.root,
    },
    port: 8080,
    reloadOnRestart: true,
  });
});

// browser-sync reload
task('reload', (done) => {
  browserSync.reload();
  done();
});

//watch
task('watch', (done) => {
  watch([paths.htmlSrc], series('html', 'reload'));
  // watch([paths.pugSrc], series('pug', 'reload'));
  watch([paths.scssSrc], series('sass', 'reload'));
  watch([paths.jsSrc], series('js', 'reload'));
  done();
});
task('default', parallel('watch', 'browser-sync'));
