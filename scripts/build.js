// -----------------------------------------------------------------------------
// This file creates a build in the dist/ folder
// -----------------------------------------------------------------------------

// libraries
const fs = require('fs-plus')
const csso = require('csso')
const uglify = require('uglify-js')

const encoding = { encoding: 'utf8' }

const package = JSON.parse(fs.readFileSync('package.json', encoding))
const version = package.version
const year = new Date().getFullYear()
const cssSrc = fs
  .readFileSync('lib/chessboard.css', encoding)
  .replace('@VERSION', version)
const rawSrc = fs
  .readFileSync('lib/chessboard.js', encoding)
  .replace('@VERSION', version)
  .replace('RUN_ASSERTS = true', 'RUN_ASSERTS = false')

const uglifyResult = uglify.minify(rawSrc)
const minSrc = uglifyResult.code
console.assert(!uglifyResult.error, 'error minifying JS: ' + uglifyResult.error)
// TODO: need to remove the RUN_ASSERTS calls from the non-minified file

const mjsmin = fs
  .readFileSync('lib/chessboard.mjs', encoding)
  .replace('INSERTSOURCE', () => minSrc)
  .replace('@VERSION', version)
const cjsmin = fs
  .readFileSync('lib/chessboard.cjs', encoding)
  .replace('INSERTSOURCE', () => minSrc)
  .replace('@VERSION', version)
const browserjsmin = fs
  .readFileSync('lib/chessboardbrowser.js', encoding)
  .replace('INSERTSOURCE', () => minSrc)
  .replace('@VERSION', version)
  .replace('const ', 'var ')
  .replace('let ', ' var ')

const mjs = fs
  .readFileSync('lib/chessboard.mjs', encoding)
  .replace('INSERTSOURCE', () => rawSrc)
  .replace('@VERSION', version)
const cjs = fs
  .readFileSync('lib/chessboard.cjs', encoding)
  .replace('INSERTSOURCE', () => rawSrc)
  .replace('@VERSION', version)
const browserjs = fs
  .readFileSync('lib/chessboardbrowser.js', encoding)
  .replace('INSERTSOURCE', () => rawSrc)
  .replace('@VERSION', version)
  .replace('const ', 'var ')
  .replace('let ', ' var ')

const minifiedCSS = csso.minify(cssSrc).css

// quick sanity checks

console.assert(
  typeof minifiedCSS === 'string' && minifiedCSS !== '',
  'error minifying CSS!',
)

// create a fresh dist/ folder
fs.removeSync('dist')
fs.makeTreeSync('dist')

// copy lib files to dist/
fs.writeFileSync('dist/chessboard.css', cssSrc, encoding)
fs.writeFileSync('dist/chessboard.min.css', minifiedCSS, encoding)

fs.writeFileSync('dist/chessboard.min.mjs', mjsmin, encoding)
fs.writeFileSync('dist/chessboard.min.cjs', cjsmin, encoding)
fs.writeFileSync('dist/chessboard.min.js', banner() + browserjsmin, encoding)

fs.writeFileSync('dist/chessboard.mjs', mjs, encoding)
fs.writeFileSync('dist/chessboard.cjs', cjs, encoding)
fs.writeFileSync('dist/chessboard.js', banner() + browserjs, encoding)

function banner() {
  return (
    '/*! chessboard.js v' +
    version +
    ' | (c) ' +
    year +
    ' Chris Oakman and Miika Tuominen | MIT License chessboardjs.com/license */\n'
  )
}
