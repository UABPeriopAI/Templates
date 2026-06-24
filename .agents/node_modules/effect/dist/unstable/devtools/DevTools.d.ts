/**
 * @since 4.0.0
 */
import * as Layer from "../../Layer.ts";
import * as Socket from "../socket/Socket.ts";
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerSocket: Layer.Layer<never, never, Socket.Socket>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layerWebSocket: (url?: string) => Layer.Layer<never, never, Socket.WebSocketConstructor>;
/**
 * @since 4.0.0
 * @category layers
 */
export declare const layer: (url?: string) => Layer.Layer<never>;
//# sourceMappingURL=DevTools.d.ts.map