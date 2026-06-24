export * from "./client.js";
export * from "./server.js";
import type { ServerOptions } from "./server.js";
export * as data from "./data.js";
export declare function createKilo(options?: ServerOptions): Promise<{
    client: import("./client.js").KiloClient;
    server: {
        url: string;
        close(): void;
    };
}>;
