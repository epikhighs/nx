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
const testing_1 = require("@angular-devkit/schematics/testing");
const workspace_1 = require("@nrwl/workspace");
const path = require("path");
describe('Update 8-5-0', () => {
    let tree;
    let schematicRunner;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        tree = schematics_1.Tree.empty();
        schematicRunner = new testing_1.SchematicTestRunner('@nrwl/web', path.join(__dirname, '../../../migrations.json'));
    }));
    it(`should remove differentialLoading as an option for build builder`, () => __awaiter(void 0, void 0, void 0, function* () {
        tree.create('workspace.json', JSON.stringify({
            projects: {
                demo: {
                    root: 'apps/demo',
                    sourceRoot: 'apps/demo/src',
                    architect: {
                        build: {
                            builder: '@nrwl/web:build',
                            options: {
                                differentialLoading: true,
                            },
                        },
                    },
                },
            },
        }));
        tree = yield schematicRunner
            .runSchematicAsync('update-builder-8.5.0', {}, tree)
            .toPromise();
        const config = workspace_1.readWorkspace(tree);
        expect(config.projects.demo.architect.build.options).toEqual({});
    }));
});
