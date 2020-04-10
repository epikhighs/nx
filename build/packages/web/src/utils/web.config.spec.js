"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web_config_1 = require("./web.config");
jest.mock('tsconfig-paths-webpack-plugin');
const tsconfig_paths_webpack_plugin_1 = require("tsconfig-paths-webpack-plugin");
const node_1 = require("@angular-devkit/core/node");
const ts = require("typescript");
const path_1 = require("path");
describe('getWebConfig', () => {
    let input;
    let logger;
    let root;
    let sourceRoot;
    let mockCompilerOptions;
    beforeEach(() => {
        input = {
            main: 'main.ts',
            index: 'index.html',
            budgets: [],
            baseHref: '/',
            deployUrl: '/',
            sourceMap: {
                scripts: true,
                styles: true,
                hidden: false,
                vendors: false
            },
            optimization: {
                scripts: false,
                styles: false
            },
            styles: [],
            scripts: [],
            outputPath: 'dist',
            tsConfig: 'tsconfig.json',
            fileReplacements: []
        };
        root = path_1.join(__dirname, '../../../..');
        sourceRoot = path_1.join(root, 'apps/app');
        logger = node_1.createConsoleLogger();
        mockCompilerOptions = {
            target: 'es2015',
            paths: { path: ['mapped/path'] }
        };
        tsconfig_paths_webpack_plugin_1.default.mockImplementation(function MockPathsPlugin() { });
        spyOn(ts, 'readConfigFile').and.callFake(() => ({
            config: {
                compilerOptions: mockCompilerOptions
            }
        }));
    });
    it('should resolve the browser main field', () => {
        const result = web_config_1.getWebConfig(root, sourceRoot, input, logger, false, false);
        expect(result.resolve.mainFields).toContain('browser');
    });
    describe('without differential loading', () => {
        describe('polyfills', () => {
            it('should set the polyfills entry', () => {
                const result = web_config_1.getWebConfig(root, sourceRoot, Object.assign(Object.assign({}, input), { polyfills: 'polyfills.ts' }), logger, false, false);
                expect(result.entry.polyfills).toEqual(['polyfills.ts']);
            });
        });
        describe('es2015 polyfills', () => {
            it('should set the es2015-polyfills', () => {
                const result = web_config_1.getWebConfig(root, sourceRoot, Object.assign(Object.assign({}, input), { es2015Polyfills: 'polyfills.es2015.ts' }), logger, false, false);
                expect(result.entry['polyfills-es5']).toEqual(['polyfills.es2015.ts']);
            });
        });
    });
    describe('with differential loading', () => {
        describe('polyfills', () => {
            it('should be in both polyfills', () => {
                const es2015Config = web_config_1.getWebConfig(root, sourceRoot, Object.assign(Object.assign({}, input), { polyfills: 'polyfills.ts' }), logger, true, true);
                expect(es2015Config.entry.polyfills).toContain('polyfills.ts');
                const es5Config = web_config_1.getWebConfig(root, sourceRoot, Object.assign(Object.assign({}, input), { polyfills: 'polyfills.ts' }), logger, false, true);
                expect(es5Config.entry.polyfills).toContain('polyfills.ts');
            });
        });
        describe('es2015Polyfills', () => {
            it('should be in es5 polyfills', () => {
                const es5Config = web_config_1.getWebConfig(root, sourceRoot, Object.assign(Object.assign({}, input), { polyfills: 'polyfills.ts', es2015Polyfills: 'polyfills.es2015.ts' }), logger, false, true);
                expect(es5Config.entry.polyfills).toContain('polyfills.es2015.ts');
            });
        });
        describe('safari polyfills', () => {
            it('should be in es2015 polyfills', () => {
                const es2015Config = web_config_1.getWebConfig(root, sourceRoot, Object.assign(Object.assign({}, input), { polyfills: 'polyfills.ts' }), logger, true, true);
                expect(es2015Config.entry.polyfills).toContain(require.resolve('@nrwl/web/src/utils/third-party/cli-files/models/safari-nomodule.js'));
            });
        });
    });
});
