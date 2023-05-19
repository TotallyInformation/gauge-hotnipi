/* eslint-disable n/no-unpublished-require, sonarjs/no-duplicate-string, jsdoc/newline-after-description, jsdoc/require-param */

/**
 * https://semaphoreci.com/community/tutorials/getting-started-with-gulp-js
 * https://gulpjs.com/plugins/
 * https://gulpjs.com/docs/en/api/concepts/
 * Plugins
 *  https://www.npmjs.com/package/gulp-json-editor - Change data in a JSON file
 *  https://www.npmjs.com/package/gulp-esbuild - supports modern es modules
 */

'use strict'

const { src, dest, series, watch, parallel, } = require('gulp')
const jeditor = require('gulp-json-editor')
const gulpEsbuild = require('gulp-esbuild')

const execa = require('execa')

const fs = require('fs-extra')

const name = 'gauge-hotnipi'
const release = '1.0.0'

// print output of commands into the terminal
const stdio = 'inherit'

// @ts-ignore
const { version } = JSON.parse(fs.readFileSync('package.json'))
console.log(`Current Version: ${version}. Requested Release Version: ${release}`)

/** Pack (Uglify) ESM Version
 * @param {Function} cb Callback
 */
function packESMmin(cb) {
    src(`${name}.js`)
        .pipe(gulpEsbuild({
            outfile: `${name}.esm.min.js`,
            bundle: true,
            format: 'esm',
            platform: 'browser',
            minify: true,
            sourcemap: true,
            target: [
                // 'es2019',
                // Start of 2019
                'chrome72',
                'safari12.1',
                'firefox65',
                'opera58',

                // For private class fields:
                // 'chrome74',   // Apr 23, 2019
                // 'opera62',    // Jun 27, 2019
                // 'edge79',     // Jan 15, 2020
                // 'safari14.1', // Apr 26, 2021
                // 'firefox90',  // Jul 13, 2021

                // If we need top-level await
                // 'chrome89',  // March 1, 2021
                // 'edge89',
                // 'opera75',   // Mar 24, 2021
                // 'firefox89', // Jun 1, 2021
                // 'safari15',  // Sep 20, 2021
            ]
        }))
        .on('error', function(err) {
            console.error('[packESMmin] ERROR ', err)
            cb(err)
        })
        //.pipe(greplace(/="(.*)-mod"/, '="$1-esm.min"'))
        .pipe(dest('./'))
        .on('end', function() {
            // in case of success
            cb()
        })
}

/** Pack (Uglify) IIFE version
 * @param {Function} cb Callback
 */
function packIIFEmin(cb) {
    src(`${name}.js`)
        .pipe(gulpEsbuild({
            outfile: `${name}.iife.min.js`,
            bundle: true,
            format: 'iife',
            platform: 'browser',
            minify: true,
            sourcemap: true,
            target: [
                // 'es2019',
                // Start of 2019
                'chrome72',
                'safari12.1',
                'firefox65',
                'opera58',

                // For private class fields:
                // 'chrome74',   // Apr 23, 2019
                // 'opera62',    // Jun 27, 2019
                // 'edge79',     // Jan 15, 2020
                // 'safari14.1', // Apr 26, 2021
                // 'firefox90',  // Jul 13, 2021

                // If we need top-level await
                // 'chrome89',  // March 1, 2021
                // 'edge89',
                // 'opera75',   // Mar 24, 2021
                // 'firefox89', // Jun 1, 2021
                // 'safari15',  // Sep 20, 2021
            ]
        }))
        .on('error', function(err) {
            console.error('[packIIFEmin] ERROR ', err)
            cb(err)
        })
        // .pipe(greplace(/="(.*)-mod"/, '="$1-iife.min"'))
        .pipe(dest('./'))
        .on('end', function() {
            // in case of success
            cb()
        })
}

const buildme = parallel(packESMmin, packIIFEmin)

/** Watch for changes during development of uibuilderfe & editor */
function watchme(cb) {
    // Re-pack uibuilderfe if it changes
    watch(`./${name}.js`, buildme)
    cb()
}

//#region ---- set versions ----

/** Set uibuilder version in package.json */
function setPackageVersion(cb) {
    if (version !== release) {
        // bump version without committing and tagging
        // await execa('npm', ['version', release, '--no-git-tag-version'], {stdio})
        src('./package.json')
            .pipe(jeditor({ 'version': release } ) )
            .pipe(dest('.') )
    } else {
        console.log('setPackageVersion: Requested version is same as current version - nothing will change')
    }
    cb()
}
/** Set uibuilder version in package-lock.json */
function setPackageLockVersion(cb) {
    if (version !== release) {
        src('./package-lock.json')
            .pipe(jeditor({ 'version': release } ) )
            .pipe(dest('.') )
    }
    cb()
}

//#endregion ---- ---- ----

/** Create a new GitHub tag for a release (only if release ver # different to last committed tag) */
async function createTag(cb) {
    // Get the last committed tag: git describe --tags --abbrev=0
    let lastTag
    try {
        lastTag = (await execa('git', ['describe', '--tags', '--abbrev=0'])).stdout
    } catch (e) {
        lastTag = ''
    }

    console.log(`Last committed tag: ${lastTag}`)

    // If the last committed tag is different to the required release ...
    if ( lastTag.replace('v', '') !== release ) {
        await execa('git', ['tag', `v${release}`], { stdio })
        await execa('git', ['push', '--follow-tags'], { stdio })
        await execa('git', ['push', 'origin', '--tags'], { stdio })
    } else {
        console.log('Requested release version is same as the latest tag - not creating tag')
    }
    cb()
}

exports.watch       = watchme
exports.build       = buildme
exports.createTag   = createTag
exports.setVersion  = series( setPackageVersion, setPackageLockVersion )
