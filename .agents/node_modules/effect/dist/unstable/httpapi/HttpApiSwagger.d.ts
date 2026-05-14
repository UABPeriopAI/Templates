import type * as Layer from "../../Layer.ts";
import * as HttpRouter from "../http/HttpRouter.ts";
import type * as HttpApi from "./HttpApi.ts";
import type * as HttpApiGroup from "./HttpApiGroup.ts";
/**
 * Exported layer mounting Swagger/OpenAPI documentation UI.
 *
 * @param options.path Optional mount path (default "/docs").
 *
 * @since 4.0.0
 * @category layers
 */
export declare const layer: <Id extends string, Groups extends HttpApiGroup.Any>(api: HttpApi.HttpApi<Id, Groups>, options?: {
    readonly path?: `/${string}` | undefined;
}) => Layer.Layer<never, never, HttpRouter.HttpRouter>;
//# sourceMappingURL=HttpApiSwagger.d.ts.map