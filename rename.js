var fs = require('fs')
var glob = require('glob')

var exampleFiles = glob.sync('examples/*.example')

exampleFiles.forEach(processFile)

function processFile (f) {
  var fileContents = fs.readFileSync(f, {encoding:'utf8'})
  var lines = fileContents.split('\n')

  lines = lines.map(processLine)

  fs.writeFileSync(f, lines.join('\n'))
}

function processLine (line) {
  line = line.replace('docs#', 'docs.html#')
  return line
}
