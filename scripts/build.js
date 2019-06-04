// -----------------------------------------------------------------------------
// This file creates a build in the dist/ folder
// -----------------------------------------------------------------------------

// libraries
const fs = require('fs-plus')
const csso = require('csso')
const uglify = require('uglify-js')

const encoding = {encoding: 'utf8'}

const cssSrc = fs.readFileSync('lib/chessboard.css', encoding)
const jsSrc = fs.readFileSync('lib/chessboard.js', encoding)
const minifiedCss = csso.minify(cssSrc).css
const uglifyResult = uglify.minify(jsSrc)
const minifiedJS = uglifyResult.code

console.assert(!uglifyResult.error, 'error minifying JS!')

// TODO: add license to the top of minified JS

// TODO: assert that the CSS is valid

// create a fresh dist/ folder
fs.removeSync('dist')
fs.makeTreeSync('dist')

// TODO: replace @version variable
// TODO: minify JS
// TODO: minify CSS

// copy lib files to dist/
fs.writeFileSync('dist/chessboard.css', cssSrc, encoding)
fs.writeFileSync('dist/chessboard.min.css', minifiedCss, encoding)
fs.writeFileSync('dist/chessboard.js', jsSrc, encoding)
fs.writeFileSync('dist/chessboard.min.js', minifiedJS, encoding)


// TODO:
// - copy the JS file to dist/
// - copy the CSS file to dist/
// - modify the JS file for version, copyright year, RUN_ASSERTS
// - minify the JS file
// - minify the CSS file
