//Dependencias
var gulp = require("gulp");
var sass = require("gulp-sass");
var ts = require("gulp-typescript");
var merge = require("merge2");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var minify = require("gulp-minifier");
var del = require("del");
var imagemin = require("gulp-imagemin");
var htmlreplace = require("gulp-html-replace");

//Rutas: Estilo {dir1,dir2,...,dir3} para un listado con opciones
var sassFiles = "src/scss/**/*.scss";
var cssDest = "src/css";
var cssMin = [
  "node_modules/tooltipster/dist/css/tooltipster.bundle.min.css",
  "node_modules/tooltipster/dist/css/plugins/tooltipster/sideTip/themes/*.css",
  "src/css/estilo.css"
];
var cssFinal = "estilo.css";
var cssFinalMin = "estilo.min.css";
var cssDep = cssMin.slice(0, cssMin.length - 1);
var cssDepMin = "dependencias.min.css";

//Rutas: Aplicación
var tsFiles = "src/ts/**/*.ts";
var jsDest = "src/js";
var dtsDest = "src/dts";
var jsMin = [
  "src/js/setup/setup.js",
  "src/js/utils/**/*.js",
  "src/js/visualizaciones/**/*.js",
  "src/js/main/**/*.js"
];
var jsFinalMin = "aplicacion.min.js";
var jsSrc = "aplicacion.js";
var jsDep = [
  "node_modules/jquery/dist/jquery.min.js",
  "node_modules/jquery-visible/jquery.visible.min.js",
  "node_modules/d3/d3.min.js",
  "node_modules/d3-queue/build/d3-queue.min.js",
  "node_modules/topojson/build/topojson.min.js",
  "node_modules/lodash/lodash.min.js",
  "node_modules/tooltipster/dist/js/tooltipster.bundle.min.js",
  "node_modules/downloadjs/download.min.js"
];
var jsDepMin = "dependencias.min.js";

//Rutas: Documento
var htmlFiles = "src/**/*.html";

//Rutas: Imágenes
var imgFiles = "src/img/**/*";

//Rutas: Assets
var assetFiles = [
  "src/assets/**/*",
  "src/csv/**/*.csv",
  "src/tsv/**/*.tsv",
  "src/json/**/*.json"
];

//Inicialización de objetos
var tsProject = ts.createProject("tsconfig.json");

//Tareas: sass
gulp.task("sass", function() {
  return gulp
    .src(sassFiles)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))
    .pipe(concat(cssFinal))
    .pipe(sourcemaps.write(""))
    .pipe(gulp.dest(cssDest));
});

//Tareas: typescript
gulp.task("typescript", function() {
  var tsResult = tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject());

  return merge([
    tsResult.dts.pipe(gulp.dest(dtsDest)),
    tsResult.js.pipe(sourcemaps.write("")).pipe(gulp.dest(jsDest))
  ]);
});

//Tareas: minifyDepCSS
gulp.task("minifyDepCSS", function() {
  return gulp
    .src(cssDep)
    .pipe(sourcemaps.init())
    .pipe(concat(cssDepMin))
    .pipe(
      minify({
        minify: true,
        collapseWhitespace: true,
        minifyCSS: true
      })
    )
    .pipe(sourcemaps.write(""))
    .pipe(gulp.dest("src/css"));
});

//Tareas: minifyDepJS
gulp.task("minifyDepJS", function() {
  return gulp
    .src(jsDep)
    .pipe(sourcemaps.init())
    .pipe(concat(jsDepMin))
    .pipe(
      minify({
        minify: true,
        collapseWhitespace: true,
        minifyJS: true
      })
    )
    .pipe(sourcemaps.write(""))
    .pipe(gulp.dest("src/js"));
});

//Tareas: init
gulp.task(
  "init",
  ["minifyDepCSS", "minifyDepJS", "sass", "compileJS"],
  function() {
    gulp.watch(sassFiles, ["sass"]);
    gulp.watch(jsMin, ["compileJS"]);
  }
);

//Tareas clean
gulp.task("clean", function() {
  del.sync("dist/**");
});

//Tareas: minifyCSS
gulp.task("minifyCSS", function() {
  return gulp
    .src(cssMin)
    .pipe(sourcemaps.init())
    .pipe(concat(cssFinalMin))
    .pipe(
      minify({
        minify: true,
        collapseWhitespace: true,
        minifyCSS: true
      })
    )
    .pipe(sourcemaps.write(""))
    .pipe(gulp.dest("dist/css"));
});

//Tareas: compileJS
gulp.task("compileJS", function() {
  return gulp
    .src(jsMin)
    .pipe(sourcemaps.init())
    .pipe(concat(jsSrc))
    .pipe(sourcemaps.write(""))
    .pipe(gulp.dest("src/js"));
});

//Tareas: minifyJS
gulp.task("minifyJS", function() {
  return gulp
    .src(jsDep.concat(jsMin))
    .pipe(sourcemaps.init())
    .pipe(concat(jsFinalMin))
    .pipe(
      minify({
        minify: true,
        collapseWhitespace: true,
        minifyJS: true
      })
    )
    .pipe(sourcemaps.write(""))
    .pipe(gulp.dest("dist/js"));
});

//Tareas: minifyHTML
gulp.task("minifyHTML", function() {
  return gulp
    .src(htmlFiles)
    .pipe(
      htmlreplace({
        css: "css/estilo.min.css",
        js: "js/aplicacion.min.js"
      })
    )
    .pipe(
      minify({
        minify: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        decodeEntities: true,
        removeComments: true
      })
    )
    .pipe(gulp.dest("dist"));
});

//Tarea: images
gulp.task("images", function() {
  return gulp
    .src(imgFiles)
    .pipe(imagemin())
    .pipe(gulp.dest("dist/img"));
});

//Tareas: copyAssets
gulp.task("copyAssets", function() {
  return gulp
    .src(assetFiles, {
      base: "src"
    })
    .pipe(gulp.dest("dist"));
});

//Tareas: build
gulp.task("build", [
  "clean",
  "sass",
  "minifyCSS",
  "minifyJS",
  "minifyHTML",
  "images",
  "copyAssets"
]);

//Tarea por defecto
gulp.task("default", ["build"]);
