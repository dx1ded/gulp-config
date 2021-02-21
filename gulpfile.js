const 
  projectFolder = 'dist',
  sourceFolder = 'src',
  path = {
    build: {
      html: `${projectFolder}/`,
      css: `${projectFolder}/css`,
      js: `${projectFolder}/js`,
      img: `${projectFolder}/img`,
      fonts: `${projectFolder}/fonts`
    },

    src: {
      html: [`${sourceFolder}/*.html`, `!${sourceFolder}/_*.html`],
      css: `${sourceFolder}/scss/style.scss`,
      js: `${sourceFolder}/js/index.js`,
      img: `${sourceFolder}/img/**/*.{jpg,png,svg,gif,ico,webp}`,
      fonts: `${sourceFolder}/fonts/*.ttf`
    },

    watch: {
      html: `${sourceFolder}/**/*.html`,
      css: `${sourceFolder}/scss/**/*.scss`,
      js: `${sourceFolder}/js/**/*.js`,
      img: `${sourceFolder}/img/**/*.{jpg,png,svg,gif,ico,webp}`
    },

    clean: `./${projectFolder}/`
  }

const 
  { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browserSync = require('browser-sync').create(),
  fileInclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('@selfisekai/gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  groupMedia = require('gulp-group-css-media-queries'),
  cleanCSS = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  babel = require('gulp-babel'),
  imageMin = require('gulp-imagemin'),
  webP = require('gulp-webp'),
  webPHTML = require('gulp-webp-html'),
  webPCSS = require('gulp-webpcss')

function browserSyncTask() {
  browserSync.init({
    port: 3000,
    notify: false,
    server: {
      baseDir: `./${projectFolder}/`
    }
  })
}

function htmlTask() {
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(webPHTML())
    .pipe(dest(path.build.html))
    .pipe(browserSync.stream())
}

function cssTask() {
  return src(path.src.css)
    .pipe(scss({
      outputStyle: 'expanded',
      includePaths: ['node_modules']
    }))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 5 versions'],
      cascade: true
    }))
    .pipe(webPCSS())
    .pipe(groupMedia())
    .pipe(dest(path.build.css))
    .pipe(cleanCSS())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSync.stream())
}

function jsTask() {
  return src(path.src.js)
    .pipe(fileInclude())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSync.stream())
}

function imageTask() {
  return src(path.src.img)
    .pipe(webP({
      quality: 70
    }))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(imageMin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizationLevel: 3
    }))
    .pipe(dest(path.build.img))
    .pipe(browserSync.stream())
}

function watchFiles() {
  gulp.watch([path.watch.html], htmlTask)
  gulp.watch([path.watch.css], cssTask)
  gulp.watch([path.watch.js], jsTask)
  gulp.watch([path.watch.img], imageTask)
}

function clean() {
  return del(path.clean)
}

const
  build = gulp.series(clean, gulp.parallel(jsTask, cssTask, htmlTask, imageTask)),
  watch = gulp.parallel(build, browserSyncTask, watchFiles)

exports.build = build
exports.watch = watch
exports.default = watch
