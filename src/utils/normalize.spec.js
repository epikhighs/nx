"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalize_1 = require("./normalize");
const core_1 = require("@angular-devkit/core");
const fs = require("fs");
describe('normalizeBuildOptions', () => {
    let testOptions;
    let root;
    let sourceRoot;
    beforeEach(() => {
        testOptions = {
            main: 'apps/nodeapp/src/main.ts',
            tsConfig: 'apps/nodeapp/tsconfig.app.json',
            outputPath: 'dist/apps/nodeapp',
            fileReplacements: [
                {
                    replace: 'apps/environment/environment.ts',
                    with: 'apps/environment/environment.prod.ts'
                },
                {
                    replace: 'module1.ts',
                    with: 'module2.ts'
                }
            ],
            assets: [],
            statsJson: false,
            webpackConfig: 'apps/nodeapp/webpack.config'
        };
        root = '/root';
        sourceRoot = core_1.normalize('apps/nodeapp/src');
    });
    it('should resolve main from root', () => {
        const result = normalize_1.normalizeBuildOptions(testOptions, root, sourceRoot);
        expect(result.main).toEqual('/root/apps/nodeapp/src/main.ts');
    });
    it('should resolve the output path', () => {
        const result = normalize_1.normalizeBuildOptions(testOptions, root, sourceRoot);
        expect(result.outputPath).toEqual('/root/dist/apps/nodeapp');
    });
    it('should resolve the tsConfig path', () => {
        const result = normalize_1.normalizeBuildOptions(testOptions, root, sourceRoot);
        expect(result.tsConfig).toEqual('/root/apps/nodeapp/tsconfig.app.json');
    });
    it('should normalize asset patterns', () => {
        spyOn(fs, 'statSync').and.returnValue({
            isDirectory: () => true
        });
        const result = normalize_1.normalizeBuildOptions(Object.assign(Object.assign({}, testOptions), { root, assets: [
                'apps/nodeapp/src/assets',
                {
                    input: 'outsideproj',
                    output: 'output',
                    glob: '**/*',
                    ignore: ['**/*.json']
                }
            ] }), root, sourceRoot);
        expect(result.assets).toEqual([
            {
                input: '/root/apps/nodeapp/src/assets',
                output: 'assets',
                glob: '**/*'
            },
            {
                input: '/root/outsideproj',
                output: 'output',
                glob: '**/*',
                ignore: ['**/*.json']
            }
        ]);
    });
    it('should resolve the file replacement paths', () => {
        const result = normalize_1.normalizeBuildOptions(testOptions, root, sourceRoot);
        expect(result.fileReplacements).toEqual([
            {
                replace: '/root/apps/environment/environment.ts',
                with: '/root/apps/environment/environment.prod.ts'
            },
            {
                replace: '/root/module1.ts',
                with: '/root/module2.ts'
            }
        ]);
    });
    it('should resolve both node modules and relative path for webpackConfig', () => {
        let result = normalize_1.normalizeBuildOptions(testOptions, root, sourceRoot);
        expect(result.webpackConfig).toEqual('/root/apps/nodeapp/webpack.config');
        result = normalize_1.normalizeBuildOptions(Object.assign(Object.assign({}, testOptions), { webpackConfig: 'react' // something that exists in node_modules
         }), root, sourceRoot);
        expect(result.webpackConfig).toMatch('react');
        expect(result.webpackConfig).not.toMatch(root);
    });
});
describe('normalizeBundleOptions', () => {
    let testOptions;
    let root;
    let sourceRoot;
    beforeEach(() => {
        testOptions = {
            outputPath: '/tmp',
            project: 'apps/nodeapp/package.json',
            entryFile: 'apps/nodeapp/src/main.ts',
            tsConfig: 'apps/nodeapp/tsconfig.app.json',
            babelConfig: 'apps/nodeapp/babel.config',
            rollupConfig: 'apps/nodeapp/rollup.config'
        };
        root = '/root';
        sourceRoot = core_1.normalize('apps/nodeapp/src');
    });
    it('should resolve both node modules and relative path for babelConfig/rollupConfig', () => {
        let result = normalize_1.normalizeBundleOptions(testOptions, root);
        expect(result.babelConfig).toEqual('/root/apps/nodeapp/babel.config');
        expect(result.rollupConfig).toEqual('/root/apps/nodeapp/rollup.config');
        result = normalize_1.normalizeBundleOptions(Object.assign(Object.assign({}, testOptions), { 
            // something that exists in node_modules
            rollupConfig: 'react', babelConfig: 'react' }), root);
        expect(result.babelConfig).toMatch('react');
        expect(result.babelConfig).not.toMatch(root);
        expect(result.rollupConfig).toMatch('react');
        expect(result.rollupConfig).not.toMatch(root);
    });
    it('should handle babelConfig/rollupCofig being undefined', () => {
        delete testOptions.babelConfig;
        delete testOptions.rollupConfig;
        const result = normalize_1.normalizeBundleOptions(testOptions, root);
        expect(result.babelConfig).toEqual('');
        expect(result.rollupConfig).toEqual('');
    });
});
