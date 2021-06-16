import type { server } from 'typescript/lib/tsserverlibrary';
export interface Logger {
    log: (message: string) => void;
    error: (error: Error) => void;
}
export declare const createLogger: (info: server.PluginCreateInfo) => Logger;
