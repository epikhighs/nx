"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const core_1 = require("@angular-devkit/core");
const augment_index_html_1 = require("./augment-index-html");
describe('augment-index-html', () => {
    const indexGeneratorOptions = {
        input: 'index.html',
        inputContent: '<html><head></head><body></body></html>',
        baseHref: '/',
        sri: false,
        files: [],
        loadOutputFile: (_fileName) => __awaiter(void 0, void 0, void 0, function* () { return ''; }),
        entrypoints: ['scripts', 'polyfills', 'main', 'styles']
    };
    const oneLineHtml = (html) => core_1.tags.stripIndents `${html}`.replace(/(\>\s+)/g, '>');
    it('can generate index.html', () => __awaiter(void 0, void 0, void 0, function* () {
        const source = augment_index_html_1.augmentIndexHtml(Object.assign(Object.assign({}, indexGeneratorOptions), { files: [
                { file: 'styles.css', extension: '.css', name: 'styles' },
                { file: 'runtime.js', extension: '.js', name: 'main' },
                { file: 'main.js', extension: '.js', name: 'main' },
                { file: 'runtime.js', extension: '.js', name: 'polyfills' },
                { file: 'polyfills.js', extension: '.js', name: 'polyfills' }
            ] }));
        const html = yield source;
        expect(html).toEqual(oneLineHtml `
      <html>
        <head><base href="/">
          <link rel="stylesheet" href="styles.css">
        </head>
        <body>
          <script src="runtime.js" defer></script>
          <script src="polyfills.js" defer></script>
          <script src="main.js" defer></script>
        </body>
      </html>
    `);
    }));
    it(`should emit correct script tags when having 'module' and 'non-module' js`, () => __awaiter(void 0, void 0, void 0, function* () {
        const es2015JsFiles = [
            { file: 'runtime-es2015.js', extension: '.js', name: 'main' },
            { file: 'main-es2015.js', extension: '.js', name: 'main' },
            { file: 'runtime-es2015.js', extension: '.js', name: 'polyfills' },
            { file: 'polyfills-es2015.js', extension: '.js', name: 'polyfills' }
        ];
        const es5JsFiles = [
            { file: 'runtime-es5.js', extension: '.js', name: 'main' },
            { file: 'main-es5.js', extension: '.js', name: 'main' },
            { file: 'runtime-es5.js', extension: '.js', name: 'polyfills' },
            { file: 'polyfills-es5.js', extension: '.js', name: 'polyfills' }
        ];
        const source = augment_index_html_1.augmentIndexHtml(Object.assign(Object.assign({}, indexGeneratorOptions), { files: [
                { file: 'styles.css', extension: '.css', name: 'styles' },
                { file: 'styles.css', extension: '.css', name: 'styles' }
            ], moduleFiles: es2015JsFiles, noModuleFiles: es5JsFiles }));
        const html = yield source;
        expect(html).toEqual(oneLineHtml `
      <html>
        <head>
          <base href="/">
          <link rel="stylesheet" href="styles.css">
        </head>
        <body>
          <script src="runtime-es2015.js" type="module"></script>
          <script src="polyfills-es2015.js" type="module"></script>
          <script src="runtime-es5.js" nomodule defer></script>
          <script src="polyfills-es5.js" nomodule defer></script>
          <script src="main-es2015.js" type="module"></script>
          <script src="main-es5.js" nomodule defer></script>
        </body>
      </html>
    `);
    }));
    it(`should not add 'module' and 'non-module' attr to js files which are in both module formats`, () => __awaiter(void 0, void 0, void 0, function* () {
        const es2015JsFiles = [
            { file: 'scripts.js', extension: '.js', name: 'scripts' },
            { file: 'main-es2015.js', extension: '.js', name: 'main' }
        ];
        const es5JsFiles = [
            { file: 'scripts.js', extension: '.js', name: 'scripts' },
            { file: 'main-es5.js', extension: '.js', name: 'main' }
        ];
        const source = augment_index_html_1.augmentIndexHtml(Object.assign(Object.assign({}, indexGeneratorOptions), { files: [
                { file: 'styles.css', extension: '.css', name: 'styles' },
                { file: 'styles.css', extension: '.css', name: 'styles' }
            ], moduleFiles: es2015JsFiles, noModuleFiles: es5JsFiles }));
        const html = yield source;
        expect(html).toEqual(oneLineHtml `
      <html>
        <head>
          <base href="/">
          <link rel="stylesheet" href="styles.css">
        </head>
        <body>
          <script src="scripts.js" defer></script>
          <script src="main-es2015.js" type="module"></script>
          <script src="main-es5.js" nomodule defer></script>
        </body>
      </html>
    `);
    }));
});
