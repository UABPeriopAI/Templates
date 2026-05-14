/**
 * @since 4.0.0
 */
import * as Layer from "../../Layer.js";
import * as Socket from "../socket/Socket.js";
import * as DevToolsClient from "./DevToolsClient.js";
/**
 * @since 4.0.0
 * @category layers
 */
export const layerSocket = DevToolsClient.layerTracer;
/**
 * @since 4.0.0
 * @category layers
 */
export const layerWebSocket = (url = "ws://localhost:34437") => DevToolsClient.layerTracer.pipe(Layer.provide(Socket.layerWebSocket(url)));
/**
 * @since 4.0.0
 * @category layers
 */
export const layer = (url = "ws://localhost:34437") => layerWebSocket(url).pipe(Layer.provide(Socket.layerWebSocketConstructorGlobal));
//# sourceMappingURL=DevTools.js.map