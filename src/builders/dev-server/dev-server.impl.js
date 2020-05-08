"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const architect_1 = require("@angular-devkit/architect");
const rxjs_1 = require("rxjs");
const normalize_1 = require("../../utils/normalize");
const operators_1 = require("rxjs/operators");
const opn = require("opn");
const url = require("url");
const literals_1 = require("@angular-devkit/core/src/utils/literals");
const devserver_config_1 = require("../../utils/devserver.config");
const serve_path_1 = require("../../utils/serve-path");
const source_root_1 = require("../../utils/source-root");
const build_webpack_1 = require("@angular-devkit/build-webpack");
const node_1 = require("@angular-devkit/core/node");
exports.default = architect_1.createBuilder(run);
function run(serveOptions, context) {
    const host = new node_1.NodeJsSyncHost();
    return rxjs_1.forkJoin(getBuildOptions(serveOptions, context), rxjs_1.from(source_root_1.getSourceRoot(context, host))).pipe(operators_1.map(([buildOptions, sourceRoot]) => {
        buildOptions = normalize_1.normalizeWebBuildOptions(buildOptions, context.workspaceRoot, sourceRoot);
        let webpackConfig = devserver_config_1.getDevServerConfig(context.workspaceRoot, sourceRoot, buildOptions, serveOptions, context.logger);
        if (buildOptions.webpackConfig) {
            webpackConfig = require(buildOptions.webpackConfig)(webpackConfig, {
                buildOptions,
                configuration: serveOptions.buildTarget.split(':')[2],
            });
        }
        return [webpackConfig, buildOptions];
    }), operators_1.map(([_, options]) => {
        const path = serve_path_1.buildServePath(options);
        const serverUrl = url.format({
            protocol: serveOptions.ssl ? 'https' : 'http',
            hostname: serveOptions.host,
            port: serveOptions.port.toString(),
            pathname: path,
        });
        context.logger.info(literals_1.stripIndents `
            **
            Web Development Server is listening at ${serverUrl}
            **
          `);
        if (serveOptions.open) {
            opn(serverUrl, {
                wait: false,
            });
        }
        return [_, options, serverUrl];
    }), operators_1.switchMap(([config, options, serverUrl]) => {
        return build_webpack_1.runWebpackDevServer(config, context, {
            logging: (stats) => {
                context.logger.info(stats.toString(config.stats));
            },
            webpackFactory: require('webpack'),
            webpackDevServerFactory: require('webpack-dev-server'),
        }).pipe(operators_1.map((output) => {
            output.baseUrl = serverUrl;
            return output;
        }));
    }));
}
function getBuildOptions(options, context) {
    const target = architect_1.targetFromTargetString(options.buildTarget);
    const overrides = {};
    if (options.maxWorkers) {
        overrides.maxWorkers = options.maxWorkers;
    }
    if (options.memoryLimit) {
        overrides.memoryLimit = options.memoryLimit;
    }
    return rxjs_1.from(Promise.all([
        context.getTargetOptions(target),
        context.getBuilderNameForTarget(target),
    ])
        .then(([options, builderName]) => context.validateOptions(options, builderName))
        .then((options) => (Object.assign(Object.assign({}, options), overrides))));
}
