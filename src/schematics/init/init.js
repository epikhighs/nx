"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const workspace_1 = require("@nrwl/workspace");
const versions_1 = require("../../utils/versions");
const workspace_2 = require("@nrwl/workspace/src/utils/rules/workspace");
function updateDependencies() {
    return workspace_1.updateJsonInTree('package.json', (json) => {
        delete json.dependencies['@nrwl/web'];
        json.dependencies = Object.assign(Object.assign({}, json.dependencies), { 'document-register-element': versions_1.documentRegisterElementVersion });
        json.devDependencies = Object.assign(Object.assign({}, json.devDependencies), { '@nrwl/web': versions_1.nxVersion });
        return json;
    });
}
function default_1(schema) {
    return schematics_1.chain([
        workspace_2.setDefaultCollection('@nrwl/web'),
        schema.unitTestRunner === 'jest'
            ? workspace_1.addPackageWithInit('@nrwl/jest')
            : schematics_1.noop(),
        schema.e2eTestRunner === 'cypress'
            ? workspace_1.addPackageWithInit('@nrwl/cypress')
            : schematics_1.noop(),
        updateDependencies(),
        workspace_1.formatFiles(schema),
    ]);
}
exports.default = default_1;