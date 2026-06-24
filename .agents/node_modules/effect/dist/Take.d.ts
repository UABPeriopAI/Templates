/**
 * @since 2.0.0
 */
import type { NonEmptyReadonlyArray } from "./Array.ts";
import * as Exit from "./Exit.ts";
import type * as Pull from "./Pull.ts";
/**
 * @since 2.0.0
 * @category Models
 */
export type Take<A, E = never, Done = void> = NonEmptyReadonlyArray<A> | Exit.Exit<Done, E>;
/**
 * @since 4.0.0
 * @category Conversions
 */
export declare const toPull: <A, E, Done>(take: Take<A, E, Done>) => Pull.Pull<NonEmptyReadonlyArray<A>, E, Done>;
//# sourceMappingURL=Take.d.ts.map