const fs = require('fs')
const kidif = require('kidif')
const mustache = require('mustache')

const encoding = {encoding: 'utf8'}

const docsTemplate = fs.readFileSync('templates/docs.mustache', encoding)
const downloadTemplate = fs.readFileSync('templates/download.mustache', encoding)
const examplesTemplate = fs.readFileSync('templates/examples.mustache', encoding)
const homepageTemplate = fs.readFileSync('templates/homepage.mustache', encoding)
const singleExampleTemplate = fs.readFileSync('templates/single-example.mustache', encoding)
const headTemplate = fs.readFileSync('templates/_head.mustache', encoding)
const footerTemplate = fs.readFileSync('templates/_footer.mustache', encoding)
const latestChessboardjs = fs.readFileSync('src/chessboard.js', encoding)
const latestChessboardcss = fs.readFileSync('src/chessboard.css', encoding)

const examples = kidif('examples/*.example')

function writeSrcFiles () {
  fs.writeFileSync('website/js/chessboard.js', latestChessboardjs, encoding)
  fs.writeFileSync('website/css/chessboard.css', latestChessboardcss, encoding)
}

function writeHomepage () {
  const headHTML = mustache.render(headTemplate, {pageTitle: 'Homepage'})
  const html = mustache.render(homepageTemplate, {
    head: headHTML,
    footer: footerTemplate
  })
  fs.writeFileSync('website/index.html', html, encoding)
}

function writeExamplesPage () {
  const headHTML = mustache.render(headTemplate, {pageTitle: 'Examples'})
  const html = mustache.render(examplesTemplate, {
    head: headHTML,
    footer: footerTemplate
  })
  fs.writeFileSync('website/examples.html', html, encoding)
}

function writeWebsite () {
  writeSrcFiles()
  writeHomepage()
  writeExamplesPage()
  // writeDocs()
  // writeDownload()
}

writeWebsite()
