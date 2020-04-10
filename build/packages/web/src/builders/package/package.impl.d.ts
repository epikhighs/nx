import { BuilderContext, BuilderOutput } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { Observable } from 'rxjs';
import { BundleBuilderOptions } from '../../utils/types';
declare const _default: import("@angular-devkit/architect/src/internal").Builder<BundleBuilderOptions & JsonObject>;
export default _default;
export declare function run(_options: BundleBuilderOptions, context: BuilderContext): Observable<BuilderOutput>;
