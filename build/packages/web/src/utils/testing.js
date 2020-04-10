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
const path_1 = require("path");
const core_1 = require("@angular-devkit/core");
const testing_1 = require("@angular-devkit/schematics/testing");
const architect_1 = require("@angular-devkit/architect");
const testing_2 = require("@angular-devkit/architect/testing");
const testing_3 = require("@nrwl/workspace/testing");
const testRunner = new testing_1.SchematicTestRunner('@nrwl/web', path_1.join(__dirname, '../../collection.json'));
function runSchematic(schematicName, options, tree) {
    return testRunner.runSchematicAsync(schematicName, options, tree).toPromise();
}
exports.runSchematic = runSchematic;
function callRule(rule, tree) {
    return testRunner.callRule(rule, tree).toPromise();
}
exports.callRule = callRule;
function getTestArchitect() {
    return __awaiter(this, void 0, void 0, function* () {
        const architectHost = new testing_2.TestingArchitectHost('/root', '/root');
        const registry = new core_1.schema.CoreSchemaRegistry();
        registry.addPostTransform(core_1.schema.transforms.addUndefinedDefaults);
        const architect = new architect_1.Architect(architectHost, registry);
        yield architectHost.addBuilderFromPackage(path_1.join(__dirname, '../..'));
        return [architect, architectHost];
    });
}
exports.getTestArchitect = getTestArchitect;
function getMockContext() {
    return __awaiter(this, void 0, void 0, function* () {
        const [architect, architectHost] = yield getTestArchitect();
        const context = new testing_3.MockBuilderContext(architect, architectHost);
        yield context.addBuilderFromPackage(path_1.join(__dirname, '../..'));
        return context;
    });
}
exports.getMockContext = getMockContext;
