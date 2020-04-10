"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const path_1 = require("path");
const fs_1 = require("fs");
function normalizeBundleOptions(options, root) {
    const entryFile = `${root}/${options.entryFile}`;
    const entryRoot = path_1.dirname(entryFile);
    const project = `${root}/${options.project}`;
    const projectRoot = path_1.dirname(project);
    const outputPath = `${root}/${options.outputPath}`;
    return Object.assign(Object.assign({}, options), { babelConfig: normalizePluginPath(options.babelConfig, root), rollupConfig: normalizePluginPath(options.rollupConfig, root), entryFile,
        entryRoot,
        project,
        projectRoot,
        outputPath });
}
exports.normalizeBundleOptions = normalizeBundleOptions;
function normalizeBuildOptions(options, root, sourceRoot) {
    return Object.assign(Object.assign({}, options), { main: path_1.resolve(root, options.main), outputPath: path_1.resolve(root, options.outputPath), tsConfig: path_1.resolve(root, options.tsConfig), fileReplacements: normalizeFileReplacements(root, options.fileReplacements), assets: normalizeAssets(options.assets, root, sourceRoot), webpackConfig: normalizePluginPath(options.webpackConfig, root) });
}
exports.normalizeBuildOptions = normalizeBuildOptions;
function normalizePluginPath(pluginPath, root) {
    if (!pluginPath) {
        return '';
    }
    try {
        return require.resolve(pluginPath);
    }
    catch (_a) {
        return path_1.resolve(root, pluginPath);
    }
}
function normalizeAssets(assets, root, sourceRoot) {
    return assets.map(asset => {
        if (typeof asset === 'string') {
            const assetPath = core_1.normalize(asset);
            const resolvedAssetPath = path_1.resolve(root, assetPath);
            const resolvedSourceRoot = path_1.resolve(root, sourceRoot);
            if (!resolvedAssetPath.startsWith(resolvedSourceRoot)) {
                throw new Error(`The ${resolvedAssetPath} asset path must start with the project source root: ${sourceRoot}`);
            }
            const isDirectory = fs_1.statSync(resolvedAssetPath).isDirectory();
            const input = isDirectory
                ? resolvedAssetPath
                : path_1.dirname(resolvedAssetPath);
            const output = path_1.relative(resolvedSourceRoot, path_1.resolve(root, input));
            const glob = isDirectory ? '**/*' : path_1.basename(resolvedAssetPath);
            return {
                input,
                output,
                glob
            };
        }
        else {
            if (asset.output.startsWith('..')) {
                throw new Error('An asset cannot be written to a location outside of the output path.');
            }
            const assetPath = core_1.normalize(asset.input);
            const resolvedAssetPath = path_1.resolve(root, assetPath);
            return Object.assign(Object.assign({}, asset), { input: resolvedAssetPath, 
                // Now we remove starting slash to make Webpack place it from the output root.
                output: asset.output.replace(/^\//, '') });
        }
    });
}
function normalizeFileReplacements(root, fileReplacements) {
    return fileReplacements.map(fileReplacement => ({
        replace: path_1.resolve(root, fileReplacement.replace),
        with: path_1.resolve(root, fileReplacement.with)
    }));
}
function normalizeWebBuildOptions(options, root, sourceRoot) {
    return Object.assign(Object.assign({}, normalizeBuildOptions(options, root, sourceRoot)), { optimization: typeof options.optimization !== 'object'
            ? {
                scripts: options.optimization,
                styles: options.optimization
            }
            : options.optimization, sourceMap: typeof options.sourceMap === 'object'
            ? options.sourceMap
            : {
                scripts: options.sourceMap,
                styles: options.sourceMap,
                hidden: false,
                vendors: false
            }, polyfills: options.polyfills ? path_1.resolve(root, options.polyfills) : undefined, es2015Polyfills: options.es2015Polyfills
            ? path_1.resolve(root, options.es2015Polyfills)
            : undefined });
}
exports.normalizeWebBuildOptions = normalizeWebBuildOptions;
function convertBuildOptions(buildOptions) {
    const options = buildOptions;
    return Object.assign(Object.assign({}, options), { buildOptimizer: options.optimization, aot: false, forkTypeChecker: false, lazyModules: [], assets: [] });
}
exports.convertBuildOptions = convertBuildOptions;
