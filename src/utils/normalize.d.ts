import { WebBuildBuilderOptions } from '../builders/build/build.impl';
import { BuildBuilderOptions, BundleBuilderOptions } from './types';
export interface FileReplacement {
    replace: string;
    with: string;
}
export interface NormalizedBundleBuilderOptions extends BundleBuilderOptions {
    entryRoot: string;
    projectRoot: string;
}
export declare function normalizeBundleOptions(options: BundleBuilderOptions, root: any): NormalizedBundleBuilderOptions;
export declare function normalizeBuildOptions<T extends BuildBuilderOptions>(options: T, root: string, sourceRoot: string): T;
export declare function normalizeWebBuildOptions(options: WebBuildBuilderOptions, root: string, sourceRoot: string): WebBuildBuilderOptions;
export declare function convertBuildOptions(buildOptions: WebBuildBuilderOptions): any;
