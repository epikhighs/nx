"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const ts = require("typescript");
const license_webpack_plugin_1 = require("license-webpack-plugin");
const tsconfig_paths_webpack_plugin_1 = require("tsconfig-paths-webpack-plugin");
const webpack_1 = require("webpack");
const CircularDependencyPlugin = require("circular-dependency-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
jest.mock('tsconfig-paths-webpack-plugin');
describe('getBaseWebpackPartial', () => {
    let input;
    beforeEach(() => {
        input = {
            main: 'main.ts',
            outputPath: 'dist',
            tsConfig: 'tsconfig.json',
            fileReplacements: [],
            root: '/root',
            statsJson: false,
        };
        (tsconfig_paths_webpack_plugin_1.default).mockImplementation(function MockPathsPlugin() { });
    });
    describe('unconditional options', () => {
        it('should have output filename', () => {
            const result = config_1.getBaseWebpackPartial(input);
            expect(result.output.filename).toEqual('[name].js');
        });
        it('should have output path', () => {
            const result = config_1.getBaseWebpackPartial(input);
            expect(result.output.path).toEqual('dist');
        });
        it('should have a rule for typescript', () => {
            const result = config_1.getBaseWebpackPartial(input);
            const rule = result.module.rules.find((rule) => rule.test.test('app/main.ts'));
            expect(rule).toBeTruthy();
            expect(rule.loader).toEqual('babel-loader');
        });
        it('should split typescript type checking into a separate workers', () => {
            const result = config_1.getBaseWebpackPartial(input);
            const typeCheckerPlugin = result.plugins.find((plugin) => plugin instanceof ForkTsCheckerWebpackPlugin);
            expect(typeCheckerPlugin).toBeTruthy();
        });
        it('should disable performance hints', () => {
            const result = config_1.getBaseWebpackPartial(input);
            expect(result.performance).toEqual({
                hints: false,
            });
        });
        it('should resolve ts, tsx, mjs, js, and jsx', () => {
            const result = config_1.getBaseWebpackPartial(input);
            expect(result.resolve.extensions).toEqual([
                '.ts',
                '.tsx',
                '.mjs',
                '.js',
                '.jsx',
            ]);
        });
        it('should include module and main in mainFields', () => {
            spyOn(ts, 'parseJsonConfigFileContent').and.returnValue({
                options: {
                    target: 'es5',
                },
            });
            const result = config_1.getBaseWebpackPartial(input);
            expect(result.resolve.mainFields).toContain('module');
            expect(result.resolve.mainFields).toContain('main');
        });
        it('should configure stats', () => {
            const result = config_1.getBaseWebpackPartial(input);
            expect(result.stats).toEqual(jasmine.objectContaining({
                hash: true,
                timings: false,
                cached: false,
                cachedAssets: false,
                modules: false,
                warnings: true,
                errors: true,
            }));
        });
    });
    describe('the main option', () => {
        it('should set the correct entry options', () => {
            const result = config_1.getBaseWebpackPartial(input);
            expect(result.entry).toEqual({
                main: ['main.ts'],
            });
        });
    });
    describe('the output option', () => {
        it('should set the correct output options', () => {
            const result = config_1.getBaseWebpackPartial(input);
            expect(result.output.path).toEqual('dist');
        });
    });
    describe('the tsConfig option', () => {
        it('should set the correct options for the type checker plugin', () => {
            const result = config_1.getBaseWebpackPartial(input);
            const typeCheckerPlugin = result.plugins.find((plugin) => plugin instanceof ForkTsCheckerWebpackPlugin);
            expect(typeCheckerPlugin.options.tsconfig).toBe('tsconfig.json');
        });
        it('should add the TsConfigPathsPlugin for resolving', () => {
            spyOn(ts, 'parseJsonConfigFileContent').and.returnValue({
                options: {
                    paths: {
                        '@npmScope/libraryName': ['libs/libraryName/src/index.ts'],
                    },
                },
            });
            const result = config_1.getBaseWebpackPartial(input);
            expect(result.resolve.plugins.some((plugin) => plugin instanceof tsconfig_paths_webpack_plugin_1.default)).toEqual(true);
        });
        it('should include es2015 in mainFields if typescript is set es2015', () => {
            const result = config_1.getBaseWebpackPartial(input, true);
            expect(result.resolve.mainFields).toContain('es2015');
        });
    });
    describe('ES modules', () => {
        it('should override preset-env target for esm', () => {
            const result = config_1.getBaseWebpackPartial(input, true);
            expect(result.module.rules.find((rule) => rule.loader === 'babel-loader')
                .options.presets.find((p) => p[0].indexOf('@babel/preset-env') !== -1)[1]).toMatchObject({
                targets: { esmodules: true },
            });
        });
        it('should not override preset-env target for es5', () => {
            const result = config_1.getBaseWebpackPartial(input, false);
            expect(result.module.rules.find((rule) => rule.loader === 'babel-loader')
                .options.presets.find((p) => p[0].indexOf('@babel/preset-env') !== -1)[1]).toMatchObject({
                targets: undefined,
            });
        });
    });
    describe('the file replacements option', () => {
        it('should set aliases', () => {
            spyOn(ts, 'parseJsonConfigFileContent').and.returnValue({
                options: {},
            });
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { fileReplacements: [
                    {
                        replace: 'environments/environment.ts',
                        with: 'environments/environment.prod.ts',
                    },
                ] }));
            expect(result.resolve.alias).toEqual({
                'environments/environment.ts': 'environments/environment.prod.ts',
            });
        });
    });
    describe('the watch option', () => {
        it('should enable file watching', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { watch: true }));
            expect(result.watch).toEqual(true);
        });
    });
    describe('the poll option', () => {
        it('should determine the polling rate', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { poll: 1000 }));
            expect(result.watchOptions.poll).toEqual(1000);
        });
    });
    describe('the source map option', () => {
        it('should enable source-map devtool', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { sourceMap: true }));
            expect(result.devtool).toEqual('source-map');
        });
        it('should disable source-map devtool', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { sourceMap: false }));
            expect(result.devtool).toEqual(false);
        });
    });
    describe('script optimization', () => {
        describe('by default', () => {
            it('should set the mode to development', () => {
                const result = config_1.getBaseWebpackPartial(input);
                expect(result.mode).toEqual('development');
            });
        });
        describe('when true', () => {
            it('should set the mode to production', () => {
                const result = config_1.getBaseWebpackPartial(input, true, true);
                expect(result.mode).toEqual('production');
            });
        });
    });
    describe('the memory limit option', () => {
        it('should set the memory limit for the type checker', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { memoryLimit: 1024 }));
            const typeCheckerPlugin = result.plugins.find((plugin) => plugin instanceof ForkTsCheckerWebpackPlugin);
            expect(typeCheckerPlugin.options.memoryLimit).toEqual(1024);
        });
    });
    describe('the max workers option', () => {
        it('should set the maximum workers for the type checker', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { maxWorkers: 1 }));
            const typeCheckerPlugin = result.plugins.find((plugin) => plugin instanceof ForkTsCheckerWebpackPlugin);
            expect(typeCheckerPlugin.options.workers).toEqual(1);
        });
    });
    describe('the assets option', () => {
        it('should add a copy-webpack-plugin', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { assets: [
                    {
                        input: 'assets',
                        glob: '**/*',
                        output: 'assets',
                    },
                    {
                        input: '',
                        glob: 'file.txt',
                        output: '',
                    },
                ] }));
            // This test isn't great because it's hard to find CopyWebpackPlugin
            expect(result.plugins.some((plugin) => !(plugin instanceof ForkTsCheckerWebpackPlugin))).toBeTruthy();
        });
    });
    describe('the circular dependencies option', () => {
        it('should show warnings for circular dependencies', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { showCircularDependencies: true }));
            expect(result.plugins.find((plugin) => plugin instanceof CircularDependencyPlugin)).toBeTruthy();
        });
        it('should exclude node modules', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { showCircularDependencies: true }));
            const circularDependencyPlugin = result.plugins.find((plugin) => plugin instanceof CircularDependencyPlugin);
            expect(circularDependencyPlugin.options.exclude).toEqual(/[\\\/]node_modules[\\\/]/);
        });
    });
    describe('the extract licenses option', () => {
        it('should extract licenses to a separate file', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { extractLicenses: true }));
            const licensePlugin = result.plugins.find((plugin) => plugin instanceof license_webpack_plugin_1.LicenseWebpackPlugin);
            expect(licensePlugin).toBeTruthy();
        });
    });
    describe('the progress option', () => {
        it('should show build progress', () => {
            const result = config_1.getBaseWebpackPartial(Object.assign(Object.assign({}, input), { progress: true }));
            expect(result.plugins.find((plugin) => plugin instanceof webpack_1.ProgressPlugin)).toBeTruthy();
        });
    });
    describe('the verbose option', () => {
        describe('when false', () => {
            it('should configure stats to be not verbose', () => {
                const result = config_1.getBaseWebpackPartial(input);
                expect(result.stats).toEqual(jasmine.objectContaining({
                    colors: true,
                    chunks: true,
                    assets: false,
                    chunkOrigins: false,
                    chunkModules: false,
                    children: false,
                    reasons: false,
                    version: false,
                    errorDetails: false,
                    moduleTrace: false,
                    usedExports: false,
                }));
            });
        });
        describe('when true', () => {
            it('should configure stats to be verbose', () => {
                input.verbose = true;
                const result = config_1.getBaseWebpackPartial(input);
                expect(result.stats).toEqual(jasmine.objectContaining({
                    colors: false,
                    chunks: false,
                    assets: true,
                    chunkOrigins: true,
                    chunkModules: true,
                    children: true,
                    reasons: true,
                    version: true,
                    errorDetails: true,
                    moduleTrace: true,
                    usedExports: true,
                }));
            });
        });
    });
});