"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
const core_1 = require("@angular-devkit/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const package_chunk_sort_1 = require("../package-chunk-sort");
const strip_bom_1 = require("../strip-bom");
const augment_index_html_1 = require("./augment-index-html");
function writeIndexHtml({ host, outputPath, indexPath, files = [], noModuleFiles = [], moduleFiles = [], baseHref, deployUrl, sri = false, scripts = [], styles = [], postTransform, crossOrigin, }) {
    return host.read(indexPath).pipe(operators_1.map((content) => strip_bom_1.stripBom(core_1.virtualFs.fileBufferToString(content))), operators_1.switchMap((content) => augment_index_html_1.augmentIndexHtml({
        input: core_1.getSystemPath(outputPath),
        inputContent: content,
        baseHref,
        deployUrl,
        crossOrigin,
        sri,
        entrypoints: package_chunk_sort_1.generateEntryPoints({ scripts, styles }),
        files: filterAndMapBuildFiles(files, ['.js', '.css']),
        noModuleFiles: filterAndMapBuildFiles(noModuleFiles, '.js'),
        moduleFiles: filterAndMapBuildFiles(moduleFiles, '.js'),
        loadOutputFile: (filePath) => __awaiter(this, void 0, void 0, function* () {
            return host
                .read(core_1.join(core_1.dirname(outputPath), filePath))
                .pipe(operators_1.map((data) => core_1.virtualFs.fileBufferToString(data)))
                .toPromise();
        }),
    })), operators_1.switchMap((content) => postTransform ? postTransform(content) : rxjs_1.of(content)), operators_1.map((content) => core_1.virtualFs.stringToFileBuffer(content)), operators_1.switchMap((content) => host.write(outputPath, content)));
}
exports.writeIndexHtml = writeIndexHtml;
function filterAndMapBuildFiles(files, extensionFilter) {
    const filteredFiles = [];
    const validExtensions = Array.isArray(extensionFilter)
        ? extensionFilter
        : [extensionFilter];
    for (const { file, name, extension, initial } of files) {
        if (name && initial && validExtensions.includes(extension)) {
            filteredFiles.push({ file, extension, name });
        }
    }
    return filteredFiles;
}