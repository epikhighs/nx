"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const workspace_1 = require("@nrwl/workspace");
const init_1 = require("../init/init");
function createApplicationFiles(options) {
    return schematics_1.mergeWith(schematics_1.apply(schematics_1.url(`./files/app`), [
        schematics_1.template(Object.assign(Object.assign(Object.assign({}, options), workspace_1.names(options.name)), { tmpl: '', offsetFromRoot: workspace_1.offsetFromRoot(options.appProjectRoot) })),
        options.unitTestRunner === 'none'
            ? schematics_1.filter((file) => file !== '/src/app/app.spec.ts')
            : schematics_1.noop(),
        schematics_1.move(options.appProjectRoot),
    ]));
}
function updateNxJson(options) {
    return workspace_1.updateJsonInTree('nx.json', (json) => {
        json.projects[options.projectName] = { tags: options.parsedTags };
        return json;
    });
}
function addProject(options) {
    return workspace_1.updateWorkspaceInTree((json) => {
        const architect = {};
        architect.build = {
            builder: '@nrwl/web:build',
            options: {
                outputPath: core_1.join(core_1.normalize('dist'), options.appProjectRoot),
                index: core_1.join(core_1.normalize(options.appProjectRoot), 'src/index.html'),
                main: core_1.join(core_1.normalize(options.appProjectRoot), 'src/main.ts'),
                polyfills: core_1.join(core_1.normalize(options.appProjectRoot), 'src/polyfills.ts'),
                tsConfig: core_1.join(core_1.normalize(options.appProjectRoot), 'tsconfig.app.json'),
                assets: [
                    core_1.join(core_1.normalize(options.appProjectRoot), 'src/favicon.ico'),
                    core_1.join(core_1.normalize(options.appProjectRoot), 'src/assets'),
                ],
                styles: [
                    core_1.join(core_1.normalize(options.appProjectRoot), `src/styles.${options.style}`),
                ],
                scripts: [],
            },
            configurations: {
                production: {
                    fileReplacements: [
                        {
                            replace: core_1.join(core_1.normalize(options.appProjectRoot), `src/environments/environment.ts`),
                            with: core_1.join(core_1.normalize(options.appProjectRoot), `src/environments/environment.prod.ts`),
                        },
                    ],
                    optimization: true,
                    outputHashing: 'all',
                    sourceMap: false,
                    extractCss: true,
                    namedChunks: false,
                    extractLicenses: true,
                    vendorChunk: false,
                    budgets: [
                        {
                            type: 'initial',
                            maximumWarning: '2mb',
                            maximumError: '5mb',
                        },
                    ],
                },
            },
        };
        architect.serve = {
            builder: '@nrwl/web:dev-server',
            options: {
                buildTarget: `${options.projectName}:build`,
            },
            configurations: {
                production: {
                    buildTarget: `${options.projectName}:build:production`,
                },
            },
        };
        architect.lint = workspace_1.generateProjectLint(core_1.normalize(options.appProjectRoot), core_1.join(core_1.normalize(options.appProjectRoot), 'tsconfig.app.json'), options.linter);
        json.projects[options.projectName] = {
            root: options.appProjectRoot,
            sourceRoot: core_1.join(core_1.normalize(options.appProjectRoot), 'src'),
            projectType: 'application',
            schematics: {},
            architect,
        };
        json.defaultProject = json.defaultProject || options.projectName;
        return json;
    });
}
function default_1(schema) {
    return (host, context) => {
        const options = normalizeOptions(host, schema);
        return schematics_1.chain([
            init_1.default(Object.assign(Object.assign({}, options), { skipFormat: true })),
            workspace_1.addLintFiles(options.appProjectRoot, options.linter),
            createApplicationFiles(options),
            updateNxJson(options),
            addProject(options),
            options.e2eTestRunner === 'cypress'
                ? schematics_1.externalSchematic('@nrwl/cypress', 'cypress-project', Object.assign(Object.assign({}, options), { name: options.name + '-e2e', directory: options.directory, project: options.projectName }))
                : schematics_1.noop(),
            options.unitTestRunner === 'jest'
                ? schematics_1.externalSchematic('@nrwl/jest', 'jest-project', {
                    project: options.projectName,
                    skipSerializers: true,
                    setupFile: 'web-components',
                })
                : schematics_1.noop(),
            workspace_1.formatFiles(options),
        ])(host, context);
    };
}
exports.default = default_1;
function normalizeOptions(host, options) {
    const appDirectory = options.directory
        ? `${workspace_1.toFileName(options.directory)}/${workspace_1.toFileName(options.name)}`
        : workspace_1.toFileName(options.name);
    const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');
    const e2eProjectName = `${appProjectName}-e2e`;
    const appProjectRoot = `apps/${appDirectory}`;
    const e2eProjectRoot = `apps/${appDirectory}-e2e`;
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];
    const defaultPrefix = workspace_1.getNpmScope(host);
    return Object.assign(Object.assign({}, options), { prefix: options.prefix ? options.prefix : defaultPrefix, name: workspace_1.toFileName(options.name), projectName: appProjectName, appProjectRoot,
        e2eProjectRoot,
        e2eProjectName,
        parsedTags });
}
