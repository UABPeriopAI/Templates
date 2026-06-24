/**
 * @since 4.0.0
 */
import * as Context from "../../Context.ts";
import type * as Rpc from "../rpc/Rpc.ts";
import type { EntityId } from "./EntityId.ts";
import type { Request } from "./Envelope.ts";
/**
 * @since 4.0.0
 * @category Annotations
 */
export declare const Persisted: Context.Reference<boolean>;
/**
 * Whether to wrap the request with a storage transaction, so sql queries are
 * committed atomically.
 *
 * @since 4.0.0
 * @category Annotations
 */
export declare const WithTransaction: Context.Reference<boolean>;
/**
 * @since 4.0.0
 * @category Annotations
 */
export declare const Uninterruptible: Context.Reference<boolean | "server" | "client">;
/**
 * @since 4.0.0
 * @category Annotations
 */
export declare const isUninterruptibleForServer: (context: Context.Context<never>) => boolean;
/**
 * @since 4.0.0
 * @category Annotations
 */
export declare const isUninterruptibleForClient: (context: Context.Context<never>) => boolean;
/**
 * @since 4.0.0
 * @category Annotations
 */
export declare const ShardGroup: Context.Reference<(entityId: EntityId) => string>;
/**
 * @since 4.0.0
 * @category Annotations
 */
export declare const ClientTracingEnabled: Context.Reference<boolean>;
/**
 * Dynamically transform the request annotations based on the request.
 * This only applies to the requests handled by the Entity, not the client.
 *
 * @since 4.0.0
 * @category Annotations
 */
export declare const Dynamic: Context.Reference<(annotations: Context.Context<never>, request: Request<Rpc.AnyWithProps>) => Context.Context<never>>;
//# sourceMappingURL=ClusterSchema.d.ts.map