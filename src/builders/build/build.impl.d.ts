import { BuilderContext } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { BuildResult } from '@angular-devkit/build-webpack';
import { BuildBuilderOptions } from '../../utils/types';
import { CrossOriginValue } from '../../utils/third-party/cli-files/utilities/index-file/augment-index-html';
export interface WebBuildBuilderOptions extends BuildBuilderOptions {
    index: string;
    budgets: any[];
    baseHref: string;
    deployUrl: string;
    extractCss?: boolean;
    crossOrigin?: CrossOriginValue;
    polyfills?: string;
    es2015Polyfills?: string;
    scripts: string[];
    styles: string[];
    vendorChunk?: boolean;
    commonChunk?: boolean;
    stylePreprocessingOptions?: any;
    subresourceIntegrity?: boolean;
    verbose?: boolean;
    buildLibsFromSource?: boolean;
}
declare const _default: import("@angular-devkit/architect/src/internal").Builder<WebBuildBuilderOptions & JsonObject>;
export default _default;
export declare function run(options: WebBuildBuilderOptions, context: BuilderContext): import("rxjs").Observable<BuildResult>;
