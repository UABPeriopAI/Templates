import * as Duration from "../../Duration.ts";
import * as Effect from "../../Effect.ts";
import * as Scope from "../../Scope.ts";
import * as Headers from "../../unstable/http/Headers.ts";
import * as HttpClient from "../../unstable/http/HttpClient.ts";
import type { HttpBody } from "../http/HttpBody.ts";
/**
 * @since 4.0.0
 * @category Constructors
 */
export declare const make: (options: {
    readonly url: string;
    readonly headers: Headers.Input | undefined;
    readonly label: string;
    readonly exportInterval: Duration.Input;
    readonly maxBatchSize: number | "disabled";
    readonly body: (data: Array<any>) => HttpBody;
    readonly shutdownTimeout: Duration.Input;
}) => Effect.Effect<{
    readonly push: (data: unknown) => void;
}, never, HttpClient.HttpClient | Scope.Scope>;
//# sourceMappingURL=OtlpExporter.d.ts.map