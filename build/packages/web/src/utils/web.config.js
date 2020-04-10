"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mergeWebpack = require("webpack-merge");
// TODO @FrozenPandaz we should remove the following imports
const browser_1 = require("./third-party/cli-files/models/webpack-configs/browser");
const common_1 = require("./third-party/cli-files/models/webpack-configs/common");
const styles_1 = require("./third-party/cli-files/models/webpack-configs/styles");
const path_1 = require("path");
const normalize_1 = require("./normalize");
const workspace_1 = require("@nrwl/workspace");
const config_1 = require("./config");
const index_html_webpack_plugin_1 = require("./third-party/cli-files/plugins/index-html-webpack-plugin");
const package_chunk_sort_1 = require("./third-party/cli-files/utilities/package-chunk-sort");
const typescript_1 = require("typescript");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
function getWebConfig(root, sourceRoot, options, logger, esm, isScriptOptimizeOn) {
    const tsConfig = workspace_1.readTsConfig(options.tsConfig);
    if (isScriptOptimizeOn) {
        // Angular CLI uses an environment variable (NG_BUILD_DIFFERENTIAL_FULL)
        // to determine whether to use the scriptTargetOverride
        // or the tsConfig target
        // We want to force the target if overriden
        tsConfig.options.target = typescript_1.ScriptTarget.ES5;
    }
    const wco = {
        root,
        projectRoot: path_1.resolve(root, sourceRoot),
        buildOptions: normalize_1.convertBuildOptions(options),
        esm,
        logger,
        tsConfig,
        tsConfigPath: options.tsConfig
    };
    return mergeWebpack([
        _getBaseWebpackPartial(options, esm, isScriptOptimizeOn),
        getPolyfillsPartial(options, esm, isScriptOptimizeOn),
        getStylesPartial(wco, options),
        getCommonPartial(wco),
        getBrowserPartial(wco, options, isScriptOptimizeOn)
    ]);
}
exports.getWebConfig = getWebConfig;
function getBrowserPartial(wco, options, isScriptOptimizeOn) {
    const config = browser_1.getBrowserConfig(wco);
    if (!isScriptOptimizeOn) {
        const { deployUrl, subresourceIntegrity, scripts = [], styles = [], index, baseHref } = options;
        config.plugins.push(new index_html_webpack_plugin_1.IndexHtmlWebpackPlugin({
            input: path_1.resolve(wco.root, index),
            output: path_1.basename(index),
            baseHref,
            entrypoints: package_chunk_sort_1.generateEntryPoints({ scripts, styles }),
            deployUrl: deployUrl,
            sri: subresourceIntegrity,
            noModuleEntrypoints: ['polyfills-es5']
        }));
    }
    return config;
}
function _getBaseWebpackPartial(options, esm, isScriptOptimizeOn) {
    let partial = config_1.getBaseWebpackPartial(options, esm, isScriptOptimizeOn);
    delete partial.resolve.mainFields;
    return partial;
}
function getCommonPartial(wco) {
    const commonConfig = common_1.getCommonConfig(wco);
    delete commonConfig.entry;
    // delete commonConfig.devtool;
    delete commonConfig.resolve.modules;
    delete commonConfig.resolve.extensions;
    delete commonConfig.output.path;
    delete commonConfig.module;
    return commonConfig;
}
function getStylesPartial(wco, options) {
    const partial = styles_1.getStylesConfig(wco);
    const rules = partial.module.rules.map(rule => {
        if (!Array.isArray(rule.use)) {
            return rule;
        }
        rule.use = rule.use.map(loaderConfig => {
            if (typeof loaderConfig === 'object' &&
                loaderConfig.loader === 'raw-loader') {
                return {
                    loader: 'style-loader'
                };
            }
            return loaderConfig;
        });
        return rule;
    });
    partial.module.rules = [
        {
            test: /\.css$|\.scss$|\.sass$|\.less$|\.styl$/,
            oneOf: [
                {
                    test: /\.module\.css$/,
                    use: [
                        {
                            loader: options.extractCss
                                ? MiniCssExtractPlugin.loader
                                : 'style-loader'
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                importLoaders: 1
                            }
                        }
                    ]
                },
                {
                    test: /\.module\.(scss|sass)$/,
                    use: [
                        {
                            loader: options.extractCss
                                ? MiniCssExtractPlugin.loader
                                : 'style-loader'
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                importLoaders: 1
                            }
                        }
                    ]
                },
                ...rules
            ]
        }
    ];
    return partial;
}
function getPolyfillsPartial(options, esm, isScriptOptimizeOn) {
    const config = {
        entry: {}
    };
    if (options.polyfills && esm && isScriptOptimizeOn) {
        // Safari 10.1 supports <script type="module"> but not <script nomodule>.
        // Need to patch it up so the browser doesn't load both sets.
        config.entry.polyfills = [
            require.resolve('@nrwl/web/src/utils/third-party/cli-files/models/safari-nomodule.js'),
            ...(options.polyfills ? [options.polyfills] : [])
        ];
    }
    else if (options.es2015Polyfills && !esm && isScriptOptimizeOn) {
        config.entry.polyfills = [
            options.es2015Polyfills,
            ...(options.polyfills ? [options.polyfills] : [])
        ];
    }
    else {
        if (options.polyfills) {
            config.entry.polyfills = [options.polyfills];
        }
        if (options.es2015Polyfills) {
            config.entry['polyfills-es5'] = [options.es2015Polyfills];
        }
    }
    return config;
}
