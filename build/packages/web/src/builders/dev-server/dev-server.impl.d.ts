import { JsonObject } from '@angular-devkit/core';
export interface WebDevServerOptions extends JsonObject {
    host: string;
    port: number;
    publicHost?: string;
    ssl: boolean;
    sslKey?: string;
    sslCert?: string;
    proxyConfig?: string;
    buildTarget: string;
    open: boolean;
    liveReload: boolean;
    watch: boolean;
    allowedHosts: string;
    maxWorkers?: number;
    memoryLimit?: number;
}
declare const _default: import("@angular-devkit/architect/src/internal").Builder<WebDevServerOptions>;
export default _default;
