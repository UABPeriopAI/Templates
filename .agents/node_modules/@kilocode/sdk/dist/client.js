export * from "./gen/types.gen.js";
import { createClient } from "./gen/client/client.gen.js";
import { KiloClient } from "./gen/sdk.gen.js";
export { KiloClient };
function pick(value, fallback) {
    if (!value)
        return;
    if (!fallback)
        return value;
    if (value === fallback)
        return fallback;
    if (value === encodeURIComponent(fallback))
        return fallback;
    return value;
}
function rewrite(request, directory) {
    if (request.method !== "GET" && request.method !== "HEAD")
        return request;
    const value = pick(request.headers.get("x-kilo-directory"), directory);
    if (!value)
        return request;
    const url = new URL(request.url);
    if (!url.searchParams.has("directory")) {
        url.searchParams.set("directory", value);
    }
    const next = new Request(url.href, request); // kilocode_change
    next.headers.delete("x-kilo-directory");
    return next;
}
export function createKiloClient(config) {
    if (!config?.fetch) {
        const customFetch = (req) => {
            // Pass duplex in the init arg so it survives VS Code's proxy-agent
            // fetch wrapper, which calls originalFetch(request, { ...init, dispatcher })
            // and would otherwise drop duplex from the cloned Request.
            // timeout: false disables Bun's default request timeout for long-running
            // streaming calls (replaces the old req.timeout = false assignment which
            // wouldn't survive the clone triggered by passing an init object).
            return fetch(req, { duplex: "half", timeout: false });
        };
        config = {
            ...config,
            fetch: customFetch,
        };
    }
    if (config?.directory) {
        config.headers = {
            ...config.headers,
            "x-kilo-directory": encodeURIComponent(config.directory),
        };
    }
    // Node.js/Electron require duplex: "half" when creating Request objects
    // with a body. The option propagates through config → opts → requestInit
    // and is harmless in environments that don't need it (Bun, browsers).
    ;
    config.duplex = "half";
    const client = createClient(config);
    client.interceptors.request.use((request) => rewrite(request, config?.directory));
    return new KiloClient({ client });
}
