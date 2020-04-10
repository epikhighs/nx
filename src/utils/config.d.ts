import { Configuration } from 'webpack';
import { BuildBuilderOptions } from './types';
export declare function getBaseWebpackPartial(options: BuildBuilderOptions, esm?: boolean, isScriptOptimizeOn?: boolean): Configuration;
export declare function createTerserPlugin(esm: boolean, sourceMap: boolean): any;
