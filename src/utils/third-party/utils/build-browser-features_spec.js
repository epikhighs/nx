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
const testing_1 = require("@angular-devkit/architect/testing");
const core_1 = require("@angular-devkit/core");
const typescript_1 = require("typescript");
const build_browser_features_1 = require("./build-browser-features");
const devkitRoot = global._DevKitRoot; // tslint:disable-line:no-any
const workspaceRoot = core_1.join(devkitRoot, 'tests/angular_devkit/build_angular/hello-world-app/');
const host = new testing_1.TestProjectHost(workspaceRoot);
describe('BuildBrowserFeatures', () => {
    let workspaceRootSysPath = '';
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield host.initialize().toPromise();
        workspaceRootSysPath = core_1.getSystemPath(host.root());
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () { return host.restore().toPromise(); }));
    describe('isDifferentialLoadingNeeded', () => {
        it('should be true for for IE 9-11 and ES2015', () => {
            host.writeMultipleFiles({
                browserslist: 'IE 9-11'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isDifferentialLoadingNeeded()).toBe(true);
        });
        it('should be false for Chrome and ES2015', () => {
            host.writeMultipleFiles({
                browserslist: 'last 1 chrome version'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isDifferentialLoadingNeeded()).toBe(false);
        });
        it('detects no need for differential loading for target is ES5', () => {
            host.writeMultipleFiles({
                browserslist: 'last 1 chrome version'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES5);
            expect(buildBrowserFeatures.isDifferentialLoadingNeeded()).toBe(false);
        });
        it('should be false for Safari 10.1 when target is ES2015', () => {
            host.writeMultipleFiles({
                browserslist: 'Safari 10.1'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isDifferentialLoadingNeeded()).toBe(false);
        });
    });
    describe('isFeatureSupported', () => {
        it('should be true for es6-module and Safari 10.1', () => {
            host.writeMultipleFiles({
                browserslist: 'Safari 10.1'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isFeatureSupported('es6-module')).toBe(true);
        });
        it('should be false for es6-module and IE9', () => {
            host.writeMultipleFiles({
                browserslist: 'IE 9'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isFeatureSupported('es6-module')).toBe(false);
        });
        it('should be true for es6-module and last 1 chrome version', () => {
            host.writeMultipleFiles({
                browserslist: 'last 1 chrome version'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isFeatureSupported('es6-module')).toBe(true);
        });
        it('should be true for es6-module and Edge 18', () => {
            host.writeMultipleFiles({
                browserslist: 'Edge 18'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isFeatureSupported('es6-module')).toBe(true);
        });
    });
    describe('isNoModulePolyfillNeeded', () => {
        it('should be false for Safari 10.1 when target is ES5', () => {
            host.writeMultipleFiles({
                browserslist: 'Safari 10.1'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES5);
            expect(buildBrowserFeatures.isNoModulePolyfillNeeded()).toBe(false);
        });
        it('should be false for Safari 10.1 when target is ES2015', () => {
            host.writeMultipleFiles({
                browserslist: 'Safari 10.1'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isNoModulePolyfillNeeded()).toBe(false);
        });
        it('should be true for Safari 9+ when target is ES2015', () => {
            host.writeMultipleFiles({
                browserslist: 'Safari >= 9'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isNoModulePolyfillNeeded()).toBe(true);
        });
        it('should be false for Safari 9+ when target is ES5', () => {
            host.writeMultipleFiles({
                browserslist: 'Safari >= 9'
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES5);
            expect(buildBrowserFeatures.isNoModulePolyfillNeeded()).toBe(false);
        });
        it('should be false when not supporting Safari 10.1 target is ES2015', () => {
            host.writeMultipleFiles({
                browserslist: `
          Edge 18
          IE 9
        `
            });
            const buildBrowserFeatures = new build_browser_features_1.BuildBrowserFeatures(workspaceRootSysPath, typescript_1.ScriptTarget.ES2015);
            expect(buildBrowserFeatures.isNoModulePolyfillNeeded()).toBe(false);
        });
    });
});
