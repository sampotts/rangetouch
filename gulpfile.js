// ==========================================================================
// Gulp build script
// ==========================================================================

const path = require('path');
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const less = require('gulp-less');
const clean = require('gulp-clean-css');
const prefix = require('gulp-autoprefixer');
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const open = require('gulp-open');
const size = require('gulp-size');
const aws = require('aws-sdk');
const publish = require('gulp-awspublish');
const log = require('fancy-log');

const pkg = require('./package.json');
const bundles = require('./bundles.json');
const deploy = require('./deploy.json');

const { browserslist, version } = pkg;

// Get AWS config
Object.values(deploy).forEach(target => {
    Object.assign(target, {
        publisher: publish.create({
            region: target.region,
            params: {
                Bucket: target.bucket,
            },
            credentials: new aws.SharedIniFileCredentials({ profile: 'rangetouch' }),
        }),
    });
});

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

const build = {
    js: (files, bundle) => {
        Object.keys(files).forEach(key => {
            const name = `js-${key}`;
            tasks.js.push(name);

            gulp.task(name, () => {
                return gulp
                    .src(bundles[bundle].js[key])
                    .pipe(plumber())
                    .pipe(concat(key))
                    .pipe(terser())
                    .pipe(
                        size({
                            showFiles: true,
                            gzip: true,
                        }),
                    )
                    .pipe(gulp.dest(paths[bundle].output));
            });
        });
    },
    less: (files, bundle) => {
        Object.keys(files).forEach(key => {
            const name = `less-${key}`;
            tasks.less.push(name);

            gulp.task(name, () => {
                return gulp
                    .src(bundles[bundle].less[key])
                    .pipe(less())
                    .pipe(concat(key))
                    .pipe(
                        prefix(browserslist, {
                            cascade: false,
                        }),
                    )
                    .pipe(clean())
                    .pipe(
                        size({
                            showFiles: true,
                            gzip: true,
                        }),
                    )
                    .pipe(gulp.dest(paths[bundle].output));
            });
        });
    },
    sprite: bundle => {
        const name = `sprite-${bundle}`;
        tasks.sprite.push(name);

        // Process Icons
        gulp.task(name, () => {
            return gulp
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
                        basename: bundle === 'rangetouch' ? 'sprite' : bundle,
                    }),
                )
                .pipe(
                    size({
                        showFiles: true,
                        gzip: true,
                    }),
                )
                .pipe(gulp.dest(paths[bundle].output));
        });
    },
};

// Core files
build.js(bundles.rangetouch.js, 'rangetouch');

// Docs files
build.less(bundles.docs.less, 'docs');
build.js(bundles.docs.js, 'docs');
build.sprite('docs');

// Build all JS
gulp.task('js', gulp.parallel(...tasks.js));

// Watch for file changes
gulp.task('watch', () => {
    // Core
    gulp.watch(paths.rangetouch.src.js, gulp.parallel(...tasks.js));

    // Docs
    gulp.watch(paths.docs.src.js, gulp.parallel(...tasks.js));
    gulp.watch(paths.docs.src.less, gulp.parallel(...tasks.less));
    gulp.watch(paths.docs.src.sprite, gulp.parallel(...tasks.sprite));
});

// Default gulp task
gulp.task('default', gulp.parallel(...tasks.js, ...tasks.less, ...tasks.sprite, 'watch'));

// Publish a version to CDN and docs
// --------------------------------------------

// Some options
const maxAge = 31536000; // seconds 1 year
const headers = {
    cdn: {
        'Cache-Control': `max-age=${maxAge}`,
    },
    docs: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    },
};

const regex = '(\\d+\\.)?(\\d+\\.)?(\\*|\\d+)';
const cdnpath = new RegExp(`${deploy.cdn.domain}/${regex}`, 'gi');
const semver = new RegExp(`v${regex}`, 'gi');
const localpath = new RegExp('(../)?dist', 'gi');

// Publish version to CDN bucket
gulp.task('cdn', () => {
    const { bucket, publisher } = deploy.cdn;

    if (!publisher) {
        throw new Error('No publisher instance. Check AWS configuration.');
    }

    log(`Uploading ${version} to ${bucket}`);

    // Upload to CDN
    return gulp
        .src(paths.upload)
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
        .pipe(publisher.publish(headers.cdn))
        .pipe(publish.reporter());
});

// Replace versioned files in readme.md
gulp.task('docs:readme', () => {
    const { domain } = deploy.docs;

    return gulp
        .src([`${root}/readme.md`])
        .pipe(replace(cdnpath, `${domain}/${version}`))
        .pipe(gulp.dest(root));
});

// Replace versions in rangetouch.js
gulp.task('docs:src', () =>
    gulp
        .src(path.join(root, 'src/js/rangetouch.js'))
        .pipe(replace(semver, `v${version}`))
        .pipe(gulp.dest(path.join(root, 'src/js/'))),
);

// Replace local file paths with remote paths in docs
// e.g. "../dist/rangetouch.js" to "https://cdn.rangetouch.com/x.x.x/rangetouch.js"
gulp.task('docs:paths', () => {
    const { domain, publisher } = deploy.docs;

    if (!publisher) {
        throw new Error('No publisher instance. Check AWS configuration.');
    }

    return gulp
        .src([`${paths.docs.root}*.html`])
        .pipe(replace(localpath, `https://${domain}/${version}`))
        .pipe(publisher.publish(headers.docs))
        .pipe(publish.reporter());
});

// Upload error.html to cdn (as well as docs site)
gulp.task('docs:error', () => {
    const { domain, publisher } = deploy.docs;

    if (!publisher) {
        throw new Error('No publisher instance. Check AWS configuration.');
    }

    return gulp
        .src([`${paths.docs.root}error.html`])
        .pipe(replace(localpath, `https://${domain}/${version}`))
        .pipe(publisher.publish(headers.docs))
        .pipe(publish.reporter());
});

// Publish to Docs bucket
gulp.task('docs', gulp.parallel('docs:readme', 'docs:src', 'docs:paths', 'docs:error'));

// Open the docs site to check it's sweet
gulp.task('open', () => {
    const { bucket } = deploy.docs;

    log(`Opening ${bucket}...`);

    // A file must be specified or gulp will skip the task
    // Doesn't matter which file since we set the URL above
    // Weird, I know...
    return gulp.src([`${paths.docs.root}index.html`]).pipe(
        open('', {
            url: `https://${bucket}`,
        }),
    );
});

// Do everything
gulp.task('publish', gulp.series(gulp.parallel(...tasks.js, ...tasks.less, ...tasks.sprite), 'cdn', 'docs'));
