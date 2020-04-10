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
const rxjs_1 = require("rxjs");
const path_1 = require("path");
const core_1 = require("@angular-devkit/core");
const f = require("@nrwl/workspace/src/utils/fileutils");
const impl = require("./package.impl");
const rr = require("./run-rollup");
const testing_1 = require("../../utils/testing");
const projectGraphUtils = require("@nrwl/workspace/src/core/project-graph");
jest.mock('tsconfig-paths-webpack-plugin');
describe('WebPackagebuilder', () => {
    let context;
    let testOptions;
    let runRollup;
    let writeJsonFile;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        context = yield testing_1.getMockContext();
        context.target.project = 'example';
        testOptions = {
            entryFile: 'libs/ui/src/index.ts',
            outputPath: 'dist/ui',
            project: 'libs/ui/package.json',
            tsConfig: 'libs/ui/tsconfig.json',
            watch: false
        };
        spyOn(core_1.workspaces, 'readWorkspace').and.returnValue({
            workspace: {
                projects: {
                    get: () => ({
                        sourceRoot: path_1.join(__dirname, '../../..')
                    })
                }
            }
        });
        spyOn(f, 'readJsonFile').and.returnValue({
            name: 'example'
        });
        writeJsonFile = spyOn(f, 'writeJsonFile');
        spyOn(projectGraphUtils, 'createProjectGraph').and.callFake(() => {
            return {
                nodes: {},
                dependencies: {}
            };
        });
    }));
    describe('run', () => {
        it('should call runRollup with esm and umd', () => __awaiter(void 0, void 0, void 0, function* () {
            runRollup = spyOn(rr, 'runRollup').and.callFake(() => {
                return rxjs_1.of({
                    success: true
                });
            });
            spyOn(context.logger, 'info');
            const result = yield impl.run(testOptions, context).toPromise();
            expect(runRollup).toHaveBeenCalled();
            expect(runRollup.calls.allArgs()[0][0].output.map(o => o.format)).toEqual(expect.arrayContaining(['esm', 'umd']));
            expect(result.success).toBe(true);
            expect(context.logger.info).toHaveBeenCalledWith('Bundle complete.');
        }));
        it('should return failure when rollup fails', () => __awaiter(void 0, void 0, void 0, function* () {
            runRollup = spyOn(rr, 'runRollup').and.callFake(() => rxjs_1.throwError('Oops'));
            spyOn(context.logger, 'error');
            const result = yield impl.run(testOptions, context).toPromise();
            expect(result.success).toBe(false);
            expect(f.writeJsonFile).not.toHaveBeenCalled();
            expect(context.logger.error).toHaveBeenCalledWith('Bundle failed.');
        }));
        it('updates package.json', () => __awaiter(void 0, void 0, void 0, function* () {
            runRollup = spyOn(rr, 'runRollup').and.callFake(() => {
                return rxjs_1.of({
                    success: true
                });
            });
            yield impl.run(testOptions, context).toPromise();
            expect(f.writeJsonFile).toHaveBeenCalled();
            const content = writeJsonFile.calls.allArgs()[0][1];
            expect(content).toMatchObject({
                name: 'example',
                main: './example.umd.js',
                module: './example.esm.js',
                typings: './index.d.ts'
            });
        }));
    });
});
