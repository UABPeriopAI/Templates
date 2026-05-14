/**
 * @since 4.0.0
 */
import * as Effect from "../../Effect.js";
import * as HttpRouter from "../http/HttpRouter.js";
import * as HttpServerResponse from "../http/HttpServerResponse.js";
import * as Html from "./internal/html.js";
import * as internal from "./internal/httpApiScalar.js";
import * as OpenApi from "./OpenApi.js";
const makeHandler = options => {
  const spec = OpenApi.fromApi(options.api);
  const scalarConfig = {
    _integration: "html",
    ...options.scalar
  };
  const response = HttpServerResponse.html(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${Html.escape(spec.info.title)}</title>
    ${!spec.info.description ? "" : `<meta name="description" content="${Html.escape(spec.info.description)}"/>`}
    ${!spec.info.description ? "" : `<meta name="og:description" content="${Html.escape(spec.info.description)}"/>`}
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" type="application/json">
      ${Html.escapeJson(spec)}
    </script>
    <script>
      document.getElementById('api-reference').dataset.configuration = JSON.stringify(${Html.escapeJson(scalarConfig)})
    </script>
    ${options.source._tag === "Cdn" ? `<script src="${`https://cdn.jsdelivr.net/npm/@scalar/api-reference@${options.source.version ?? "latest"}/dist/browser/standalone.min.js`}" crossorigin></script>` : `<script>${options.source.source}</script>`}
  </body>
</html>`);
  return Effect.succeed(response);
};
/**
 * @since 4.0.0
 * @category layers
 */
export const layer = (api, options) => HttpRouter.use(Effect.fnUntraced(function* (router) {
  const handler = makeHandler({
    api,
    source: {
      _tag: "Inline",
      source: internal.javascript
    },
    scalar: options?.scalar
  });
  yield* router.add("GET", options?.path ?? "/docs", handler);
}));
/**
 * @since 4.0.0
 * @category layers
 */
export const layerCdn = (api, options) => HttpRouter.use(Effect.fnUntraced(function* (router) {
  const handler = makeHandler({
    api,
    source: {
      _tag: "Cdn",
      version: options?.version
    },
    scalar: options?.scalar
  });
  yield* router.add("GET", options?.path ?? "/docs", handler);
}));
//# sourceMappingURL=HttpApiScalar.js.map