import { Configuration } from 'webpack';
import { LoggerApi } from '@angular-devkit/core/src/logger';
import { WebBuildBuilderOptions } from '../builders/build/build.impl';
import { WebDevServerOptions } from '../builders/dev-server/dev-server.impl';
export declare function getDevServerConfig(root: string, sourceRoot: string, buildOptions: WebBuildBuilderOptions, serveOptions: WebDevServerOptions, logger: LoggerApi): Configuration;
