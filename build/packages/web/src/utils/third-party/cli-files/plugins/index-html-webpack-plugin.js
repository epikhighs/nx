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
const path = require("path");
const webpack_sources_1 = require("webpack-sources");
const augment_index_html_1 = require("../utilities/index-file/augment-index-html");
const strip_bom_1 = require("../utilities/strip-bom");
function readFile(filename, compilation) {
    return new Promise((resolve, reject) => {
        compilation.inputFileSystem.readFile(filename, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(strip_bom_1.stripBom(data.toString()));
        });
    });
}
class IndexHtmlWebpackPlugin {
    constructor(options) {
        this._options = Object.assign({ input: 'index.html', output: 'index.html', entrypoints: ['polyfills', 'main'], noModuleEntrypoints: [], moduleEntrypoints: [], sri: false }, options);
    }
    apply(compiler) {
        compiler.hooks.emit.tapPromise('index-html-webpack-plugin', (compilation) => __awaiter(this, void 0, void 0, function* () {
            // Get input html file
            const inputContent = yield readFile(this._options.input, compilation);
            compilation.fileDependencies.add(this._options.input);
            // Get all files for selected entrypoints
            const files = [];
            const noModuleFiles = [];
            const moduleFiles = [];
            for (const [entryName, entrypoint] of compilation.entrypoints) {
                const entryFiles = ((entrypoint && entrypoint.getFiles()) ||
                    []).map((f) => ({
                    name: entryName,
                    file: f,
                    extension: path.extname(f)
                }));
                if (this._options.noModuleEntrypoints.includes(entryName)) {
                    noModuleFiles.push(...entryFiles);
                }
                else if (this._options.moduleEntrypoints.includes(entryName)) {
                    moduleFiles.push(...entryFiles);
                }
                else {
                    files.push(...entryFiles);
                }
            }
            const loadOutputFile = (name) => compilation.assets[name].source();
            let indexSource = yield augment_index_html_1.augmentIndexHtml({
                input: this._options.input,
                inputContent,
                baseHref: this._options.baseHref,
                deployUrl: this._options.deployUrl,
                sri: this._options.sri,
                crossOrigin: this._options.crossOrigin,
                files,
                noModuleFiles,
                loadOutputFile,
                moduleFiles,
                entrypoints: this._options.entrypoints
            });
            if (this._options.postTransform) {
                indexSource = yield this._options.postTransform(indexSource);
            }
            // Add to compilation assets
            compilation.assets[this._options.output] = new webpack_sources_1.RawSource(indexSource);
        }));
    }
}
exports.IndexHtmlWebpackPlugin = IndexHtmlWebpackPlugin;
