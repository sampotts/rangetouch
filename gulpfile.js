// ==========================================================================
// Gulp build script
// ==========================================================================

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const concat = require('gulp-concat');
const less = require('gulp-less');
const clean = require('gulp-clean-css');
const run = require('run-sequence');
const prefix = require('gulp-autoprefixer');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const rename = require('gulp-rename');
const s3 = require('gulp-s3');
const replace = require('gulp-replace');
const open = require('gulp-open');
const size = require('gulp-size');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;

const root = __dirname;
const paths = {
    rangetouch: {
        // Source paths
        src: {
            js: path.join(root, 'src/js/**/*'),
        },
        // Output paths
        output: path.join(root, 'dist/'),
    },
    docs: {
        // Source paths
        src: {
            less: path.join(root, 'docs/src/less/**/*'),
            js: path.join(root, 'docs/src/js/**/*'),
            sprite: path.join(root, 'docs/src/sprite/**/*'),
        },
        // Output paths
        output: path.join(root, 'docs/dist/'),
        // Docs
        root: path.join(root, 'docs/'),
    },
    upload: [path.join(root, 'dist/**'), path.join(root, 'docs/dist/**')],
};

// Task arrays
const tasks = {
    less: [],
    sass: [],
    js: [],
    sprite: [],
};

// Load json
const loadJSON = path => {
    try {
        return JSON.parse(fs.readFileSync(path));
    } catch (err) {
        return {};
    }
};

// Fetch bundles from JSON
const bundles = loadJSON(path.join(root, 'bundles.json'));

// Babel config
const babelrc = {
    babelrc: false,
    presets: [
        '@babel/env',
        [
            'minify',
            {
                builtIns: false, // Temporary fix for https://github.com/babel/minify/issues/904
            },
        ],
    ],
};

// Size plugin
const sizeOptions = { showFiles: true, gzip: true };

// JavaScript
// Formats to build
const formats = {
    es: {
        format: 'es',
        ext: 'mjs',
        polyfill: false,
    },
    umd: {
        format: 'umd',
        ext: 'js',
        polyfill: false,
    },
};

const namespace = 'RangeTouch';

const build = {
    js: (files, bundle) => {
        Object.entries(formats).forEach(([format, task]) => {
            Object.keys(files).forEach(file => {
                const name = `js:${format}:${file}`;
                tasks.js.push(name);

                gulp.task(name, () =>
                    gulp
                        .src(bundles[bundle].js[file])
                        .pipe(concat(file))
                        .pipe(sourcemaps.init())
                        .pipe(
                            rollup(
                                {
                                    plugins: [
                                        resolve(),
                                        commonjs(),
                                        babel(babelrc),
                                    ],
                                },
                                {
                                    name: namespace,
                                    // exports: 'named',
                                    format: task.format,
                                },
                            ),
                        )
                        .pipe(uglify())
                        .pipe(
                            rename({
                                extname: `.${task.ext}`,
                            }),
                        )
                        .pipe(size(sizeOptions))
                        .pipe(sourcemaps.write(''))
                        .pipe(
                            size({
                                showFiles: true,
                                gzip: true,
                            }),
                        )
                        .pipe(gulp.dest(paths[bundle].output)),
                );
            });
        });
    },
    less: (files, bundle) => {
        Object.keys(files).forEach(file => {
            const name = `less:${file}`;
            tasks.less.push(name);

            gulp.task(name, () =>
                gulp
                    .src(bundles[bundle].less[file])
                    .pipe(less())
                    .on('error', gutil.log)
                    .pipe(concat(file))
                    .pipe(
                        prefix(['last 2 versions'], {
                            cascade: true,
                        }),
                    )
                    .pipe(clean())
                    .pipe(
                        size({
                            showFiles: true,
                            gzip: true,
                        }),
                    )
                    .pipe(gulp.dest(paths[bundle].output)),
            );
        });
    },
    sprite: bundle => {
        const name = `sprite:${bundle}`;
        tasks.sprite.push(name);

        // Process Icons
        gulp.task(name, () =>
            gulp
                .src(paths[bundle].src.sprite)
                .pipe(
                    svgmin({
                        plugins: [
                            {
                                removeDesc: true,
                            },
                        ],
                    }),
                )
                .pipe(svgstore())
                .pipe(
                    rename({
                        basename: bundle == 'rangetouch' ? 'sprite' : bundle,
                    }),
                )
                .pipe(
                    size({
                        showFiles: true,
                        gzip: true,
                    }),
                )
                .pipe(gulp.dest(paths[bundle].output)),
        );
    },
};

// Core files
build.js(bundles.rangetouch.js, 'rangetouch');

// Docs files
build.less(bundles.docs.less, 'docs');
build.js(bundles.docs.js, 'docs');
build.sprite('docs');

// Build all JS
gulp.task('js', () => {
    run(tasks.js);
});

// Build SASS (for testing, default is LESS)
gulp.task('sass', () => {
    run(tasks.sass);
});

// Watch for file changes
gulp.task('watch', () => {
    // Core
    gulp.watch(paths.rangetouch.src.js, tasks.js);

    // Docs
    gulp.watch(paths.docs.src.js, tasks.js);
    gulp.watch(paths.docs.src.less, tasks.less);
    gulp.watch(paths.docs.src.sprite, tasks.sprite);
});

// Default gulp task
gulp.task('default', () => {
    run(tasks.js, tasks.less, tasks.sprite, 'watch');
});

// Publish a version to CDN and docs
// --------------------------------------------

// Some options
const aws = loadJSON(path.join(root, 'aws.json'));
const { version } = loadJSON(path.join(root, 'package.json'));
const maxAge = 31536000; // seconds 1 year
const options = {
    cdn: {
        headers: {
            'Cache-Control': `max-age=${maxAge}`,
            Vary: 'Accept-Encoding',
        },
    },
    docs: {
        headers: {
            'Cache-Control':
                'public, must-revalidate, proxy-revalidate, max-age=0',
            Vary: 'Accept-Encoding',
        },
    },
};

// If aws is setup
if ('cdn' in aws) {
    const regex = '(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)';
    const cdnpath = new RegExp(`${aws.cdn.domain}/${regex}`, 'gi');
    const semver = new RegExp(`v${regex}`, 'gi');
    const localpath = new RegExp('(../)?dist', 'gi');

    // Publish version to CDN bucket
    gulp.task('cdn', () => {
        console.log(`Uploading ${version} to ${aws.cdn.bucket}`);

        // Upload to CDN
        gulp.src(paths.upload)
            .pipe(
                size({
                    showFiles: true,
                    gzip: true,
                }),
            )
            .pipe(
                rename(path => {
                    path.dirname = path.dirname.replace('.', version);
                }),
            )
            .pipe(s3(aws.cdn, options.cdn));
    });

    // Publish to Docs bucket
    gulp.task('docs', () => {
        console.log(`Uploading ${version} docs to ${aws.docs.bucket}`);

        // Replace versioned files in readme.md
        gulp.src([`${root}/readme.md`])
            .pipe(replace(cdnpath, `${aws.cdn.domain}/${version}`))
            .pipe(gulp.dest(root));

        // Replace versioned files in rangetouch.js
        gulp.src(path.join(root, 'src/js/rangetouch.js'))
            .pipe(replace(semver, `v${version}`))
            .pipe(gulp.dest(path.join(root, 'src/js/')));

        // Replace local file paths with remote paths in docs
        // e.g. "../dist/rangetouch.js" to "https://cdn.rangetouch.com/x.x.x/rangetouch.js"
        gulp.src([`${paths.docs.root}*.html`])
            .pipe(replace(localpath, `https://${aws.cdn.domain}/${version}`))
            .pipe(s3(aws.docs, options.docs));

        // Upload error.html to cdn (as well as docs site)
        gulp.src([`${paths.docs.root}error.html`])
            .pipe(replace(localpath, `https://${aws.cdn.domain}/${version}`))
            .pipe(s3(aws.cdn, options.docs));
    });

    // Open the docs site to check it's sweet
    gulp.task('open', () => {
        console.log(`Opening ${aws.docs.bucket}...`);

        // A file must be specified or gulp will skip the task
        // Doesn't matter which file since we set the URL above
        // Weird, I know...
        gulp.src([`${paths.docs.root}index.html`]).pipe(
            open('', {
                url: `https://${aws.docs.bucket}`,
            }),
        );
    });

    // Do everything
    gulp.task('publish', () => {
        run(tasks.js, tasks.less, tasks.sprite, 'cdn', 'docs');
    });
}
