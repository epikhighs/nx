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
const core_1 = require("@angular-devkit/core");
function getSourceRoot(context, host) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspaceHost = core_1.workspaces.createWorkspaceHost(host);
        const { workspace } = yield core_1.workspaces.readWorkspace(context.workspaceRoot, workspaceHost);
        if (workspace.projects.get(context.target.project).sourceRoot) {
            return workspace.projects.get(context.target.project).sourceRoot;
        }
        else {
            context.reportStatus('Error');
            const message = `${context.target.project} does not have a sourceRoot. Please define one.`;
            context.logger.error(message);
            throw new Error(message);
        }
    });
}
exports.getSourceRoot = getSourceRoot;
