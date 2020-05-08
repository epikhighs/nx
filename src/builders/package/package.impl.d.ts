import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { PackageBuilderOptions } from '../../utils/types';
declare const _default: import("@angular-devkit/architect/src/internal").Builder<PackageBuilderOptions & JsonObject>;
export default _default;
export declare function run(rawOptions: PackageBuilderOptions, context: BuilderContext): Observable<BuilderOutput>;
