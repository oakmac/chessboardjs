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
  const chessboardJsScript = `<script src="../dist/chessboard-${version}.js"></script>`;
  const docs = JSON.parse(await readFile('./data/docs.json', 'utf-8'));
  const examples = /** @type {{ id: number, name: string, description: string, group: string, html: string, js: string, chessboardJsScript: string, includeChessJS?: boolean }[]} */(kidif('examples/*.example'));
  const groups = ['Basic Usage', 'Config', 'Methods', 'Events', 'Integration'];
  const examplesByGroup = /** @type {Record<string, typeof examples>} */({
    [groups.at(0) ?? '']: [],
    [groups.at(1) ?? '']: [],
    [groups.at(2) ?? '']: [],
    [groups.at(3) ?? '']: [],
    [groups.at(4) ?? '']: [],
  });

  for (const example of examples) {
    example.id = Number(example.id);
    example.chessboardJsScript = chessboardJsScript;

    if (!example.id) continue;
    else if (example.id >= 5000) {
      example.includeChessJS = true;
      example.group = groups.at(4) ?? '';
    }
    else if (example.id >= 4000) example.group = groups.at(3) ?? '';
    else if (example.id >= 3000) example.group = groups.at(2) ?? '';
    else if (example.id >= 2000) example.group = groups.at(1) ?? '';
    else if (example.id >= 1000) example.group = groups.at(0) ?? '';

    examplesByGroup[example.group].push(example);
  }

  const encoding = 'utf-8';
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
      `.trim().replace(/^\s{8}/mg, ''),
      footer: footerTemplate,
      head: mustache.render(headTemplate, { pageTitle: 'Homepage', version }),
      version
    })),

    writeFile('website/examples.html', mustache.render(examplesTemplate, {
      chessboardJsScript,
      examplesJavaScript: buildExamplesJS(),
      footer: footerTemplate,
      head: mustache.render(headTemplate, { pageTitle: 'Examples', version }),
      header: mustache.render(headerTemplate, { examplesActive: true, version }),
      nav: groups.reduce((html, group, i) => {
        const groupNum = i + 1;
        html += `<h4 id="groupHeader-${groupNum}">${group}</h4><ul id="groupContainer-${groupNum}" style="display:none">`;

        for (const example of examplesByGroup[group]) {
          html += `<li id="exampleLink-${example.id}">${example.name}</id>`;
        }

        return (html += '</ul>');
      }, ''),
      version
    })),

    writeFile('website/docs.html', mustache.render(docsTemplate, {
      configTableRows: docs.config.reduce(function (html, prop) {
        if (typeof prop === 'string') return html;

        html += `<tr id="config:${prop.name}">`; // table row
        html += `<td><p><a href="docs.html#config:${prop.name}"><code class="js plain">${prop.name}</code></a></p><p class=property-type-7ae66>${buildTypeHTML(prop.type)}</p></td>`; // property and type
        html += `<td class="center"><p>${prop.default || '<small>n/a</small>'}</p></td>`; // default
        html += `<td>${buildDescriptionHTML(prop.desc)}</td>`; // description
        html += `<td>${buildExamplesCellHTML(prop.examples)}</td>`; // examples

        return html + '</tr>';
      }, ''),
      errorRows: docs.errors.reduce((html, error) => {
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
      methodTableRows: docs.methods.reduce((html, method) => {
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
    })),

    writeFile('website/download.html', mustache.render(downloadTemplate, {
      footer: footerTemplate,
      head: mustache.render(headTemplate, { pageTitle: 'Download', version }),
      header: mustache.render(headerTemplate, { downloadActive: true, version }),
      version
    })),

    writeFile('website/license.html', mustache.render(licensePageTemplate, { version })),

    Promise.all(examples.map(example => {
      return writeFile(`website/examples/${example.id}.html`, mustache.render(singleExampleTemplate, { version, ...example }));
    })),
  ]);

  // -----------------------------------------------------------------------------
  // HTML
  // -----------------------------------------------------------------------------

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
