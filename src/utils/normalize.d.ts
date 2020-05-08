import { WebBuildBuilderOptions } from '../builders/build/build.impl';
import { BuildBuilderOptions, PackageBuilderOptions } from './types';
export interface FileReplacement {
    replace: string;
    with: string;
}
export interface NormalizedBundleBuilderOptions extends PackageBuilderOptions {
    entryRoot: string;
    projectRoot: string;
    assets: NormalizedCopyAssetOption[];
}
export declare function normalizePackageOptions(options: PackageBuilderOptions, root: string, sourceRoot: string): NormalizedBundleBuilderOptions;
export declare function normalizeBuildOptions<T extends BuildBuilderOptions>(options: T, root: string, sourceRoot: string): T;
export interface NormalizedCopyAssetOption {
    glob: string;
    input: string;
    output: string;
}
export declare function normalizeAssets(assets: any[], root: string, sourceRoot: string): NormalizedCopyAssetOption[];
export declare function normalizeWebBuildOptions(options: WebBuildBuilderOptions, root: string, sourceRoot: string): WebBuildBuilderOptions;
export declare function convertBuildOptions(buildOptions: WebBuildBuilderOptions): any;
