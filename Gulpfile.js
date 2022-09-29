import { writeFile, readFile, rm, mkdir } from 'node:fs/promises';

import gulp from 'gulp';
import kidif from 'kidif';
import mustache from 'mustache';
import sass from 'sass';
import { rollup } from 'rollup';
import { terser } from 'rollup-plugin-terser';

const { version } = JSON.parse(await readFile('./package.json', 'utf-8'));
const banner = `/** @preserve
* chessboard.js v${version}
* https://github.com/oakmac/chessboardjs/
*
* Copyright (c) 2019, Chris Oakman
* Released under the MIT license
* https://github.com/oakmac/chessboardjs/blob/master/LICENSE.md
*/`;

export const build = gulp.series(resetDistFolder, gulp.parallel(buildJs, buildCss), buildWebsite);
export const watch = () => gulp.watch(['data', 'examples', 'lib', 'templates', 'website/css', 'website/js'], { ignoreInitial: false }, build);
export default build;

async function resetDistFolder() {
  await rm('./dist', { recursive: true, force: true });
  await mkdir('./dist');
}

async function buildJs() {
  const bundle = await rollup({ input: './lib/chessboard.js' });

  const format = /** @type {import('rollup').ModuleFormat} */('iife');
  const output = { banner, format, name: 'ChessboardJS', outro: `Object.assign(window, exports);` };

  return Promise.all([
    bundle.write({ file: `./dist/chessboard-${version}.js`, ...output }),
    bundle.write({ file: `./dist/chessboard-${version}.min.js`, plugins: [terser()], ...output }),
  ]);
}

async function buildCss() {
  return Promise.all([
    writeFile(`./dist/chessboard-${version}.css`, banner + '\n' + sass.compile('lib/chessboard.css').css),
    writeFile(`./dist/chessboard-${version}.min.css`, banner + '\n' + sass.compile('lib/chessboard.css', { style: 'compressed' }).css),
  ]);
}

async function buildWebsite() {
  const docs = JSON.parse(await readFile('./data/docs.json', 'utf-8'));
  const { version } = JSON.parse(await readFile('./package.json', 'utf-8'));

  const encoding = 'utf-8';
  const chessboardJsScript = `<script src="../dist/chessboard-${version}.js"></script>`;

  const [
    headTemplate,
    docsTemplate,
    downloadTemplate,
    examplesTemplate,
    homepageTemplate,
    singleExampleTemplate,
    licensePageTemplate,
    headerTemplate,
    footerTemplate,
  ] = await Promise.all([
    readFile('templates/_head.mustache', encoding),
    readFile('templates/docs.mustache', encoding),
    readFile('templates/download.mustache', encoding),
    readFile('templates/examples.mustache', encoding),
    readFile('templates/homepage.mustache', encoding),
    readFile('templates/single-example.mustache', encoding),
    readFile('templates/license.mustache', encoding),
    readFile('templates/_header.mustache', encoding),
    readFile('templates/_footer.mustache', encoding),
  ]);

  // grab the examples
  const examples = kidif('examples/*.example');
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
  ];

  await rm('./website/examples', { recursive: true, force: true });
  await mkdir('./website/examples');

  await Promise.all([
    writeFile('website/index.html', mustache.render(homepageTemplate, {
      chessboardJsScript,
      example2: `
      const board2 = new Chessboard('board2', {
        draggable: true,
        dropOffBoard: 'trash',
        sparePieces: true
      })

      document.getElementById('startBtn').onclick = () => board2.start()
      document.getElementById('clearBtn').onclick = () => board2.clear()
    `,
      footer: footerTemplate,
      head: mustache.render(headTemplate, { pageTitle: 'Homepage', version }),
      version
    }), encoding),

    writeFile('website/examples.html', mustache.render(examplesTemplate, {
      chessboardJsScript,
      examplesJavaScript: buildExamplesJS(),
      footer: footerTemplate,
      head: mustache.render(headTemplate, { pageTitle: 'Examples', version }),
      header: mustache.render(headerTemplate, { examplesActive: true, version }),
      nav: buildExamplesNavHTML(),
      version
    }), encoding),

    writeFile('website/docs.html', mustache.render(docsTemplate, {
      configTableRows: docs.config.reduce(function (html, prop) {
        if (typeof prop === 'string') return html;

        html += `<tr id="config:${prop.name}">`; // table row
        html += `<td>${buildPropertyAndTypeHTML('config', prop.name, prop.type)}</td>`; // property and type
        html += `<td class="center"><p>${prop.default || '<small>n/a</small>'}</p></td>`; // default
        html += `<td>${buildDescriptionHTML(prop.desc)}</td>`; // description
        html += `<td>${buildExamplesCellHTML(prop.examples)}</td>`; // examples

        return html + '</tr>';
      }, ''),
      errorRows: docs.errors.reduce(function (html, error) {
        if (typeof error === 'string') return html;

        html += `<tr id="errors:${error.id}">`; // table row
        html += `<td class="center"><p><a href="docs.html#errors:${error.id}">${error.id}</a></p></td>`; // id
        html += `<td><p>${error.desc}</p></td>`; // desc

        // more information
        if (error.fix) {
          html += `<td>${Array.isArray(error.fix) ? error.fix.map(p => `<p>${p}</p>`).join('') : `<p>${error.fix}</p>`}</td>`;
        } else {
          html += '<td><small>n/a</small></td>';
        }

        return html + '</tr>';
      }, ''),
      methodTableRows: docs.methods.reduce(function (html, method) {
        if (typeof method === 'string') return html;

        const nameNoParens = method.name.replace(/\(.+$/, '');

        html += method.noId ? '<tr>' : `<tr id="methods:${nameNoParens}">`; // table row
        html += `<td><p><a href="docs.html#methods:${nameNoParens}"><code class="js plain">${method.name}</code></a></p></td>`; // name
        html += Array.isArray(method.args) ? `<td>${method.args.map((arg) => '<p>' + arg[1] + '</p>').join('')}</td>` : '<td><small>none</small></td>'; // args
        html += `<td>${buildDescriptionHTML(method.desc)}</td>`; // description
        html += `<td>${buildExamplesCellHTML(method.examples)}</td>`; // examples

        return html + '</tr>';
      }, ''),
      footer: footerTemplate,
      head: mustache.render(headTemplate, { pageTitle: 'Documentation', version }),
      header: mustache.render(headerTemplate, { docsActive: true, version }),
      version,
    }), encoding),

    writeFile('website/download.html', mustache.render(downloadTemplate, {
      footer: footerTemplate,
      head: mustache.render(headTemplate, { pageTitle: 'Download', version }),
      header: mustache.render(headerTemplate, { downloadActive: true, version }),
      version
    }), encoding),

    writeFile('website/license.html', mustache.render(licensePageTemplate, { version }), encoding),

    Promise.all(examples.map(example => {
      if ((example.id + '').startsWith('5')) {
        example.includeChessJS = true;
      }
      example.chessboardJsScript = chessboardJsScript;
      return writeFile(`website/examples/${example.id}.html`, mustache.render(singleExampleTemplate, { version, ...example }), encoding);
    })),
  ]);

  // -----------------------------------------------------------------------------
  // HTML
  // -----------------------------------------------------------------------------

  function buildExamplesNavHTML() {
    let html = '';
    examplesGroups.forEach(function (group, idx) {
      const groupNum = idx + 1;
      html += '<h4 id="groupHeader-' + groupNum + '">' + group.name + '</h4>' +
        '<ul id="groupContainer-' + groupNum + '" style="display:none">';

      group.examples.forEach(function (exampleId) {
        const example = examples.find(x => x.id === exampleId) ?? {};
        html += '<li id="exampleLink-' + exampleId + '">' + example.name + '</id>';
      });

      html += '</ul>';
    });
    return html;
  }

  function buildExamplesJS() {
    let txt = 'window.CHESSBOARD_EXAMPLES = {}\n\n';

    examples.forEach(function (ex) {
      txt += 'CHESSBOARD_EXAMPLES["' + ex.id + '"] = {\n' +
        '  description: ' + JSON.stringify(ex.description) + ',\n' +
        '  html: ' + JSON.stringify(ex.html) + ',\n' +
        '  name: ' + JSON.stringify(ex.name) + ',\n' +
        '  jsStr: ' + JSON.stringify(ex.js) + ',\n' +
        '  jsFn: function () {\n' + ex.js + '\n  }\n' +
        '};\n\n';
    });

    return txt;
  }

  function buildPropertyAndTypeHTML(section, name, type) {
    let html = '<p><a href="docs.html#' + section + ':' + name + '">' +
      '<code class="js plain">' + name + '</code></a></p>' +
      '<p class=property-type-7ae66>' + buildTypeHTML(type) + '</p>';
    return html;
  }

  function buildTypeHTML(type) {
    if (!Array.isArray(type)) {
      type = [type];
    }

    let html = '';
    for (var i = 0; i < type.length; i++) {
      if (i !== 0) {
        html += ' <small>or</small><br />';
      }
      html += type[i];
    }

    return html;
  }

  function buildDescriptionHTML(desc) {
    if (!Array.isArray(desc)) {
      desc = [desc];
    }

    let html = '';
    desc.forEach(function (d) {
      html += '<p>' + d + '</p>';
    });

    return html;
  }

  function buildExamplesCellHTML(examplesIds) {
    if (!Array.isArray(examplesIds)) {
      examplesIds = [examplesIds];
    }

    let html = '';
    examplesIds.forEach(function (exampleId) {
      const example = examples.find(x => x.id === exampleId);
      if (!example) return;
      html += '<p><a href="examples.html#' + exampleId + '">' + example.name + '</a></p>';
    });

    return html;
  }
}
