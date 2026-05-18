/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.ts";
import * as Queue from "../../Queue.ts";
import * as SocketServer from "../socket/SocketServer.ts";
import * as DevToolsSchema from "./DevToolsSchema.ts";
/**
 * @since 4.0.0
 * @category models
 */
export interface Client {
    readonly queue: Queue.Dequeue<DevToolsSchema.Request.WithoutPing>;
    readonly send: (_: DevToolsSchema.Response.WithoutPong) => Effect.Effect<void>;
}
/**
 * @since 4.0.0
 * @category constructors
 */
export declare const run: <_, E, R>(handle: (client: Client) => Effect.Effect<_, E, R>) => Effect.Effect<never, SocketServer.SocketServerError, R | SocketServer.SocketServer>;
//# sourceMappingURL=DevToolsServer.d.ts.map