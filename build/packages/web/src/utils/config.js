"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack = require("webpack");
const webpack_1 = require("webpack");
const path_1 = require("path");
const license_webpack_plugin_1 = require("license-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const tsconfig_paths_webpack_plugin_1 = require("tsconfig-paths-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const hash_format_1 = require("./hash-format");
const babel_config_1 = require("./babel-config");
const IGNORED_WEBPACK_WARNINGS = [
    /The comment file/i,
    /could not find any license/i
];
function getBaseWebpackPartial(options, esm, isScriptOptimizeOn) {
    const extensions = ['.ts', '.tsx', '.mjs', '.js', '.jsx'];
    const mainFields = [...(esm ? ['es2015'] : []), 'module', 'main'];
    const hashFormat = hash_format_1.getOutputHashFormat(options.outputHashing);
    const suffixFormat = esm ? '.esm' : '.es5';
    const filename = isScriptOptimizeOn
        ? `[name]${hashFormat.script}${suffixFormat}.js`
        : '[name].js';
    const chunkFilename = isScriptOptimizeOn
        ? `[name]${hashFormat.chunk}${suffixFormat}.js`
        : '[name].js';
    const mode = isScriptOptimizeOn ? 'production' : 'development';
    const webpackConfig = {
        entry: {
            main: [options.main]
        },
        devtool: options.sourceMap ? 'source-map' : false,
        mode,
        output: {
            path: options.outputPath,
            filename,
            chunkFilename
        },
        module: {
            rules: [
                {
                    test: /\.([jt])sx?$/,
                    loader: `babel-loader`,
                    exclude: /node_modules/,
                    options: Object.assign(Object.assign({}, babel_config_1.createBabelConfig(path_1.dirname(options.main), esm, options.verbose)), { cacheDirectory: true, cacheCompression: false })
                }
            ]
        },
        resolve: {
            extensions,
            alias: getAliases(options),
            plugins: [
                new tsconfig_paths_webpack_plugin_1.default({
                    configFile: options.tsConfig,
                    extensions,
                    mainFields
                })
            ],
            // Search closest node_modules first, and then fallback to to default node module resolution scheme.
            // This ensures we are pulling the correct versions of dependencies, such as `core-js`.
            modules: [path_1.resolve(__dirname, '..', '..', 'node_modules'), 'node_modules'],
            mainFields
        },
        performance: {
            hints: false
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin({
                tsconfig: options.tsConfig,
                memoryLimit: options.memoryLimit ||
                    ForkTsCheckerWebpackPlugin.DEFAULT_MEMORY_LIMIT,
                workers: options.maxWorkers || ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE,
                useTypescriptIncrementalApi: false
            }),
            new webpack.DefinePlugin(getClientEnvironment(mode).stringified)
        ],
        watch: options.watch,
        watchOptions: {
            poll: options.poll
        },
        stats: getStatsConfig(options)
    };
    if (isScriptOptimizeOn) {
        webpackConfig.optimization = {
            minimizer: [createTerserPlugin(esm, !!options.sourceMap)],
            runtimeChunk: true
        };
    }
    const extraPlugins = [];
    if (options.progress) {
        extraPlugins.push(new webpack_1.ProgressPlugin());
    }
    if (options.extractLicenses) {
        extraPlugins.push(new license_webpack_plugin_1.LicenseWebpackPlugin({
            stats: {
                errors: false
            },
            perChunkOutput: false,
            outputFilename: `3rdpartylicenses.txt`
        }));
    }
    // process asset entries
    if (options.assets) {
        const copyWebpackPluginPatterns = options.assets.map((asset) => {
            return {
                context: asset.input,
                // Now we remove starting slash to make Webpack place it from the output root.
                to: asset.output,
                ignore: asset.ignore,
                from: {
                    glob: asset.glob,
                    dot: true
                }
            };
        });
        const copyWebpackPluginOptions = {
            ignore: ['.gitkeep', '**/.DS_Store', '**/Thumbs.db']
        };
        const copyWebpackPluginInstance = new CopyWebpackPlugin(copyWebpackPluginPatterns, copyWebpackPluginOptions);
        extraPlugins.push(copyWebpackPluginInstance);
    }
    if (options.showCircularDependencies) {
        extraPlugins.push(new CircularDependencyPlugin({
            exclude: /[\\\/]node_modules[\\\/]/
        }));
    }
    webpackConfig.plugins = [...webpackConfig.plugins, ...extraPlugins];
    return webpackConfig;
}
exports.getBaseWebpackPartial = getBaseWebpackPartial;
function getAliases(options) {
    return options.fileReplacements.reduce((aliases, replacement) => (Object.assign(Object.assign({}, aliases), { [replacement.replace]: replacement.with })), {});
}
function createTerserPlugin(esm, sourceMap) {
    return new TerserWebpackPlugin({
        parallel: true,
        cache: true,
        sourceMap,
        terserOptions: {
            ecma: esm ? 6 : 5,
            safari10: true,
            output: {
                ascii_only: true,
                comments: false,
                webkit: true
            }
        }
    });
}
exports.createTerserPlugin = createTerserPlugin;
function getStatsConfig(options) {
    return {
        hash: true,
        timings: false,
        cached: false,
        cachedAssets: false,
        modules: false,
        warnings: true,
        errors: true,
        colors: !options.verbose && !options.statsJson,
        chunks: !options.verbose,
        assets: !!options.verbose,
        chunkOrigins: !!options.verbose,
        chunkModules: !!options.verbose,
        children: !!options.verbose,
        reasons: !!options.verbose,
        version: !!options.verbose,
        errorDetails: !!options.verbose,
        moduleTrace: !!options.verbose,
        usedExports: !!options.verbose,
        warningsFilter: IGNORED_WEBPACK_WARNINGS
    };
}
// This is shamelessly taken from CRA and modified for NX use
// https://github.com/facebook/create-react-app/blob/4784997f0682e75eb32a897b4ffe34d735912e6c/packages/react-scripts/config/env.js#L71
function getClientEnvironment(mode) {
    // Grab NODE_ENV and NX_* environment variables and prepare them to be
    // injected into the application via DefinePlugin in webpack configuration.
    const NX_APP = /^NX_/i;
    const raw = Object.keys(process.env)
        .filter(key => NX_APP.test(key))
        .reduce((env, key) => {
        env[key] = process.env[key];
        return env;
    }, {
        // Useful for determining whether we’re running in production mode.
        NODE_ENV: process.env.NODE_ENV || mode
    });
    // Stringify all values so we can feed into webpack DefinePlugin
    const stringified = {
        'process.env': Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {})
    };
    return { stringified };
}
