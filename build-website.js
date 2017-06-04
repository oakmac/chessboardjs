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
const headerTemplate = fs.readFileSync('templates/_header.mustache', encoding)
const footerTemplate = fs.readFileSync('templates/_footer.mustache', encoding)
const latestChessboardjs = fs.readFileSync('src/chessboard.js', encoding)
const latestChessboardcss = fs.readFileSync('src/chessboard.css', encoding)

const examplesArr = kidif('examples/*.example')

const examplesObj = examplesArr.reduce(function (examplesObj, example, idx) {
  examplesObj[ example.id ] = example
  return examplesObj
}, {})

const examplesGroups = [
  {
    name: 'Basic Usage',
    examples: [1000, 1001, 1002, 1003, 1004]
  },
  {
    name: 'Config',
    examples: [2000, 2044, 2063, 2001, 2002, 2003, 2082, 2004, 2030, 2005, 2006]
  },
  {
    name: 'Methods',
    examples: [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007]
  },
  {
    name: 'Events',
    examples: [4000, 4001, 4002, 4003, 4004, 4005, 4006, 4011, 4012]
  },
  {
    name: 'Integration',
    examples: [5000, 5001, 5002, 5003, 5004, 5005]
  }
]

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
  const headerHTML = mustache.render(headerTemplate, {examplesActive: true})

  const html = mustache.render(examplesTemplate, {
    examplesJavaScript: buildExamplesJS(),
    head: headHTML,
    header: headerHTML,
    nav: buildExamplesNavHTML(),
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

// -----------------------------------------------------------------------------
// HTML
// -----------------------------------------------------------------------------

function buildExampleGroupHTML (idx, groupName, examplesInGroup) {
  const num = idx + 1
  let html = '<h4 id="groupHeader-' + num + '">' + groupName + '</h4>' +
    '<ul id="groupContainer-' + num + '" style="display:none">'

  examplesInGroup.forEach(function (exampleId) {
    const example = examplesObj[exampleId]
    html += '<li id="exampleLink-' + exampleId + '">' + example.name + '</id>'
  })

  html += '</ul>'

  return html
}

function buildExamplesNavHTML () {
  var html = ''
  examplesGroups.forEach(function (group, idx) {
    html += buildExampleGroupHTML(idx, group.name, group.examples)
  })
  return html
}

function buildExamplesJS () {
  var txt = 'window.CHESSBOARD_EXAMPLES = {}\n\n'

  examplesArr.forEach(function (ex) {
    txt += 'CHESSBOARD_EXAMPLES["' + ex.id + '"] = {\n' +
      '  description: ' + JSON.stringify(ex.description) + ',\n' +
      '  html: ' + JSON.stringify(ex.html) + ',\n' +
      '  name: ' + JSON.stringify(ex.name) + ',\n' +
      '  jsStr: ' + JSON.stringify(ex.js) + ',\n' +
      '  jsFn: function () {\n' + ex.js + '\n  }\n' +
      '};\n\n'
  })

  return txt
}

function htmlEscape (str) {
  return (str + '')
           .replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;')
           .replace(/'/g, '&#39;')
           .replace(/\//g, '&#x2F;')
           .replace(/`/g, '&#x60;')
}
