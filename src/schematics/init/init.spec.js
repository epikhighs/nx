"use strict";
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
const schematics_1 = require("@angular-devkit/schematics");
const testing_1 = require("@nrwl/workspace/testing");
const workspace_1 = require("@nrwl/workspace");
const testing_2 = require("../../utils/testing");
const versions_1 = require("../../utils/versions");
describe('init', () => {
    let tree;
    beforeEach(() => {
        tree = schematics_1.Tree.empty();
        tree = testing_1.createEmptyWorkspace(tree);
    });
    it('should add web dependencies', () => __awaiter(void 0, void 0, void 0, function* () {
        const existing = 'existing';
        const existingVersion = '1.0.0';
        yield testing_2.callRule(workspace_1.addDepsToPackageJson({ '@nrwl/web': versions_1.nxVersion, [existing]: existingVersion }, { [existing]: existingVersion }, false), tree);
        const result = yield testing_2.runSchematic('init', {}, tree);
        const packageJson = workspace_1.readJsonInTree(result, 'package.json');
        expect(packageJson.devDependencies['@nrwl/web']).toBeDefined();
        expect(packageJson.devDependencies[existing]).toBeDefined();
        expect(packageJson.dependencies['@nrwl/web']).toBeUndefined();
        expect(packageJson.dependencies['document-register-element']).toBeDefined();
        expect(packageJson.dependencies[existing]).toBeDefined();
    }));
    describe('defaultCollection', () => {
        it('should be set if none was set before', () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield testing_2.runSchematic('init', {}, tree);
            const workspaceJson = workspace_1.readJsonInTree(result, 'workspace.json');
            expect(workspaceJson.cli.defaultCollection).toEqual('@nrwl/web');
        }));
    });
    it('should not add jest config if unitTestRunner is none', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield testing_2.runSchematic('init', {
            unitTestRunner: 'none',
        }, tree);
        expect(result.exists('jest.config.js')).toEqual(false);
    }));
});