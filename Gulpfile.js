import { writeFile, readFile, rm, mkdir } from 'node:fs/promises';

import gulp from 'gulp';
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
  await import('./website/js/build.js');
}
