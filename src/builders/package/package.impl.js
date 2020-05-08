"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const architect_1 = require("@angular-devkit/architect");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const run_rollup_1 = require("./run-rollup");
const babel_config_1 = require("../../utils/babel-config");
const autoprefixer = require("autoprefixer");
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const peerDepsExternal = require("rollup-plugin-peer-deps-external");
const postcss = require("rollup-plugin-postcss");
const filesize = require("rollup-plugin-filesize");
const localResolve = require("rollup-plugin-local-resolve");
const normalize_1 = require("../../utils/normalize");
const name_utils_1 = require("@nrwl/workspace/src/utils/name-utils");
const fileutils_1 = require("@nrwl/workspace/src/utils/fileutils");
const project_graph_1 = require("@nrwl/workspace/src/core/project-graph");
const buildable_libs_utils_1 = require("@nrwl/workspace/src/utils/buildable-libs-utils");
const source_root_1 = require("../../utils/source-root");
const node_1 = require("@angular-devkit/core/node");
// These use require because the ES import isn't correct.
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');
const image = require('@rollup/plugin-image');
const copy = require('rollup-plugin-copy');
exports.default = architect_1.createBuilder(run);
const outputConfigs = [
    { format: 'umd', extension: 'umd' },
    { format: 'esm', extension: 'esm' },
];
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx'];
function run(rawOptions, context) {
    const host = new node_1.NodeJsSyncHost();
    const projGraph = project_graph_1.createProjectGraph();
    const { target, dependencies } = buildable_libs_utils_1.calculateProjectDependencies(projGraph, context);
    return rxjs_1.from(source_root_1.getSourceRoot(context, host)).pipe(operators_1.switchMap((sourceRoot) => {
        if (!buildable_libs_utils_1.checkDependentProjectsHaveBeenBuilt(context, dependencies)) {
            return rxjs_1.of({ success: false });
        }
        const options = normalize_1.normalizePackageOptions(rawOptions, context.workspaceRoot, sourceRoot);
        const packageJson = fileutils_1.readJsonFile(options.project);
        const rollupOptions = createRollupOptions(options, dependencies, context, packageJson);
        if (options.watch) {
            return new rxjs_1.Observable((obs) => {
                const watcher = rollup.watch([rollupOptions]);
                watcher.on('event', (data) => {
                    if (data.code === 'START') {
                        context.logger.info('Bundling...');
                    }
                    else if (data.code === 'END') {
                        updatePackageJson(options, context, target, dependencies, packageJson);
                        context.logger.info('Bundle complete. Watching for file changes...');
                        obs.next({ success: true });
                    }
                    else if (data.code === 'ERROR') {
                        context.logger.error(`Error during bundle: ${data.error.message}`);
                        obs.next({ success: false });
                    }
                });
                // Teardown logic. Close watcher when unsubscribed.
                return () => watcher.close();
            });
        }
        else {
            context.logger.info('Bundling...');
            return run_rollup_1.runRollup(rollupOptions).pipe(operators_1.catchError((e) => {
                context.logger.error(`Error during bundle: ${e}`);
                return rxjs_1.of({ success: false });
            }), operators_1.last(), operators_1.tap({
                next: (result) => {
                    if (result.success) {
                        updatePackageJson(options, context, target, dependencies, packageJson);
                        context.logger.info('Bundle complete.');
                    }
                    else {
                        context.logger.error('Bundle failed.');
                    }
                },
            }));
        }
    }));
}
exports.run = run;
// -----------------------------------------------------------------------------
function createRollupOptions(options, dependencies, context, packageJson) {
    const compilerOptionPaths = buildable_libs_utils_1.computeCompilerOptionsPaths(options.tsConfig, dependencies);
    const plugins = [
        copy({
            targets: convertCopyAssetsToRollupOptions(options.outputPath, options.assets),
        }),
        image(),
        typescript({
            check: true,
            tsconfig: options.tsConfig,
            tsconfigOverride: {
                compilerOptions: {
                    rootDir: options.entryRoot,
                    allowJs: false,
                    declaration: true,
                    paths: compilerOptionPaths,
                },
            },
        }),
        peerDepsExternal({
            packageJsonPath: options.project,
        }),
        postcss({
            inject: true,
            extract: options.extractCss,
            autoModules: true,
            plugins: [autoprefixer],
        }),
        localResolve(),
        resolve({
            preferBuiltins: true,
            extensions: fileExtensions,
        }),
        babel(Object.assign(Object.assign({}, createBabelConfig(options, options.projectRoot)), { extensions: fileExtensions, externalHelpers: false, exclude: 'node_modules/**' })),
        commonjs(),
        filesize(),
    ];
    const globals = options.globals
        ? options.globals.reduce((acc, item) => {
            acc[item.moduleId] = item.global;
            return acc;
        }, {})
        : {};
    const externalPackages = dependencies
        .map((d) => d.name)
        .concat(options.external || [])
        .concat(Object.keys(packageJson.dependencies || {}));
    const rollupConfig = {
        input: options.entryFile,
        output: outputConfigs.map((o) => {
            return {
                globals,
                format: o.format,
                file: `${options.outputPath}/${context.target.project}.${o.extension}.js`,
                name: name_utils_1.toClassName(context.target.project),
            };
        }),
        external: (id) => externalPackages.includes(id),
        plugins,
    };
    return options.rollupConfig
        ? require(options.rollupConfig)(rollupConfig)
        : rollupConfig;
}
function createBabelConfig(options, projectRoot) {
    let babelConfig = babel_config_1.createBabelConfig(projectRoot, false, false);
    if (options.babelConfig) {
        babelConfig = require(options.babelConfig)(babelConfig, options);
    }
    // Ensure async functions are transformed to promises properly.
    upsert('plugins', 'babel-plugin-transform-async-to-promises', null, babelConfig);
    upsert('plugins', '@babel/plugin-transform-regenerator', { async: false }, babelConfig);
    return babelConfig;
}
function upsert(type, pluginOrPreset, opts, config) {
    if (!config[type].some((p) => (Array.isArray(p) && p[0].indexOf(pluginOrPreset) !== -1) ||
        p.indexOf(pluginOrPreset) !== -1)) {
        const fullPath = require.resolve(pluginOrPreset);
        config[type] = config[type].concat([opts ? [fullPath, opts] : fullPath]);
    }
}
function updatePackageJson(options, context, target, dependencies, packageJson) {
    const entryFileTmpl = `./${context.target.project}.<%= extension %>.js`;
    const typingsFile = path_1.relative(options.entryRoot, options.entryFile).replace(/\.[jt]sx?$/, '.d.ts');
    packageJson.main = entryFileTmpl.replace('<%= extension %>', 'umd');
    packageJson.module = entryFileTmpl.replace('<%= extension %>', 'esm');
    packageJson.typings = `./${typingsFile}`;
    fileutils_1.writeJsonFile(`${options.outputPath}/package.json`, packageJson);
    if (dependencies.length > 0) {
        buildable_libs_utils_1.updateBuildableProjectPackageJsonDependencies(context, target, dependencies);
    }
}
function convertCopyAssetsToRollupOptions(outputPath, assets) {
    return assets
        ? assets.map((a) => ({
            src: path_1.join(a.input, a.glob),
            dest: path_1.join(outputPath, a.output),
        }))
        : undefined;
}
