"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devserver_config_1 = require("./devserver.config");
jest.mock('tsconfig-paths-webpack-plugin');
const tsconfig_paths_webpack_plugin_1 = require("tsconfig-paths-webpack-plugin");
const ts = require("typescript");
const fs = require("fs");
const path_1 = require("path");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
describe('getDevServerConfig', () => {
    let buildInput;
    let serveInput;
    let mockCompilerOptions;
    let logger;
    let root;
    let sourceRoot;
    beforeEach(() => {
        buildInput = {
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
        serveInput = {
            host: 'localhost',
            port: 4200,
            buildTarget: 'webapp:build',
            ssl: false,
            liveReload: true,
            open: false,
            watch: true,
            allowedHosts: null
        };
        tsconfig_paths_webpack_plugin_1.default.mockImplementation(function MockPathsPlugin() { });
        mockCompilerOptions = {
            target: 'es2015'
        };
        spyOn(ts, 'readConfigFile').and.callFake(() => ({
            config: {
                compilerOptions: mockCompilerOptions
            }
        }));
    });
    describe('unconditional settings', () => {
        it('should allow requests from any domain', () => {
            const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
            expect(result.headers['Access-Control-Allow-Origin']).toEqual('*');
        });
        it('should not display warnings in the overlay', () => {
            const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
            expect(result.overlay.warnings).toEqual(false);
        });
        it('should not emit stats', () => {
            const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
            expect(result.stats).toEqual(false);
        });
        it('should not have a contentBase', () => {
            const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
            expect(result.contentBase).toEqual(false);
        });
    });
    describe('host option', () => {
        it('should set the host option', () => {
            const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
            expect(result.host).toEqual('localhost');
        });
    });
    describe('port option', () => {
        it('should set the port option', () => {
            const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
            expect(result.port).toEqual(4200);
        });
    });
    describe('build options', () => {
        it('should set the history api fallback options', () => {
            const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
            expect(result.historyApiFallback).toEqual({
                index: '//index.html',
                disableDotRule: true,
                htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
            });
        });
        describe('optimization', () => {
            it('should not compress assets by default', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
                expect(result.compress).toEqual(false);
            });
            it('should compress assets if scripts optimization is on', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, Object.assign(Object.assign({}, buildInput), { optimization: {
                        scripts: true,
                        styles: false
                    } }), serveInput, logger);
                expect(result.compress).toEqual(true);
            });
            it('should compress assets if styles optimization is on', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, Object.assign(Object.assign({}, buildInput), { optimization: {
                        scripts: false,
                        styles: true
                    } }), serveInput, logger);
                expect(result.compress).toEqual(true);
            });
            it('should compress assets if all optimization is on', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, Object.assign(Object.assign({}, buildInput), { optimization: {
                        scripts: true,
                        styles: true
                    } }), serveInput, logger);
                expect(result.compress).toEqual(true);
            });
            it('should show an overlay when optimization is off', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, Object.assign(Object.assign({}, buildInput), { optimization: {
                        scripts: false,
                        styles: false
                    } }), serveInput, logger);
                expect(result.overlay.errors).toEqual(true);
            });
            it('should not show an overlay when optimization is on', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, Object.assign(Object.assign({}, buildInput), { optimization: {
                        scripts: true,
                        styles: true
                    } }), serveInput, logger);
                expect(result.overlay.errors).toEqual(false);
            });
        });
        describe('liveReload option', () => {
            it('should push the live reload entry to the main entry', () => {
                const result = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
                expect(result.entry['main']).toContain(`${require.resolve('webpack-dev-server/client')}?http://0.0.0.0:0`);
            });
            it('should push the correct entry when publicHost option is used', () => {
                const result = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, Object.assign(Object.assign({}, serveInput), { publicHost: 'www.example.com' }), logger);
                expect(result.entry['main']).toContain(`${require.resolve('webpack-dev-server/client')}?http://www.example.com/`);
            });
            it('should push the correct entry when publicHost and ssl options are used', () => {
                const result = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, Object.assign(Object.assign({}, serveInput), { ssl: true, publicHost: 'www.example.com' }), logger);
                expect(result.entry['main']).toContain(`${require.resolve('webpack-dev-server/client')}?https://www.example.com/`);
            });
        });
        describe('ssl option', () => {
            it('should set https to false if not on', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, Object.assign(Object.assign({}, buildInput), { optimization: {
                        scripts: true,
                        styles: true
                    } }), serveInput, logger);
                expect(result.https).toEqual(false);
            });
            it('should configure it with the key and cert provided when on', () => {
                spyOn(fs, 'readFileSync').and.callFake(path => {
                    if (path.endsWith('ssl.key')) {
                        return 'sslKeyContents';
                    }
                    else if (path.endsWith('ssl.cert')) {
                        return 'sslCertContents';
                    }
                });
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, Object.assign(Object.assign({}, serveInput), { ssl: true, sslKey: 'ssl.key', sslCert: 'ssl.cert' }), logger);
                expect(result.https).toEqual({
                    key: 'sslKeyContents',
                    cert: 'sslCertContents'
                });
            });
        });
        describe('proxyConfig option', () => {
            it('should setProxyConfig', () => {
                jest.mock(path_1.join(root, 'proxy.conf'), () => ({
                    proxyConfig: 'proxyConfig'
                }), {
                    virtual: true
                });
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, Object.assign(Object.assign({}, serveInput), { proxyConfig: 'proxy.conf' }), logger);
                expect(result.proxy).toEqual({
                    proxyConfig: 'proxyConfig'
                });
            });
        });
        describe('allowed hosts', () => {
            it('should have two allowed hosts', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, Object.assign(Object.assign({}, serveInput), { allowedHosts: 'host.com,subdomain.host.com' }), logger);
                expect(result.allowedHosts).toEqual(['host.com', 'subdomain.host.com']);
            });
            it('should have one allowed host', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, Object.assign(Object.assign({}, serveInput), { allowedHosts: 'host.com' }), logger);
                expect(result.allowedHosts).toEqual(['host.com']);
            });
            it('should not have allowed hosts', () => {
                const { devServer: result } = devserver_config_1.getDevServerConfig(root, sourceRoot, buildInput, serveInput, logger);
                expect(result.allowedHosts).toEqual([]);
            });
            describe('the max workers option', () => {
                it('should set the maximum workers for the type checker', () => {
                    const result = devserver_config_1.getDevServerConfig(root, sourceRoot, Object.assign(Object.assign({}, buildInput), { maxWorkers: 1 }), serveInput, logger);
                    const typeCheckerPlugin = result.plugins.find(plugin => plugin instanceof ForkTsCheckerWebpackPlugin);
                    expect(typeCheckerPlugin.options.workers).toEqual(1);
                });
            });
            describe('the memory limit option', () => {
                it('should set the memory limit for the type checker', () => {
                    const result = devserver_config_1.getDevServerConfig(root, sourceRoot, Object.assign(Object.assign({}, buildInput), { memoryLimit: 1024 }), serveInput, logger);
                    const typeCheckerPlugin = result.plugins.find(plugin => plugin instanceof ForkTsCheckerWebpackPlugin);
                    expect(typeCheckerPlugin.options.memoryLimit).toEqual(1024);
                });
            });
        });
    });
});
