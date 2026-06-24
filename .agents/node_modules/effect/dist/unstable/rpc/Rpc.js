import * as Context from "../../Context.js";
import * as Option from "../../Option.js";
import { pipeArguments } from "../../Pipeable.js";
import * as Predicate from "../../Predicate.js";
import * as PrimaryKey from "../../PrimaryKey.js";
import * as Schema from "../../Schema.js";
import * as RpcSchema from "./RpcSchema.js";
const TypeId = "~effect/rpc/Rpc";
/**
 * @since 4.0.0
 * @category guards
 */
export const isRpc = u => Predicate.hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category models
 */
export class ServerClient {
  id;
  annotations;
  constructor(id) {
    this.id = id;
    this.annotations = Context.empty();
  }
  annotate(tag, value) {
    this.annotations = Context.add(this.annotations, tag, value);
    return this;
  }
}
const Proto = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments);
  },
  setSuccess(successSchema) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema,
      errorSchema: this.errorSchema,
      defectSchema: this.defectSchema,
      annotations: this.annotations,
      middlewares: this.middlewares
    });
  },
  setError(errorSchema) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema,
      defectSchema: this.defectSchema,
      annotations: this.annotations,
      middlewares: this.middlewares
    });
  },
  setPayload(payloadSchema) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: Schema.isSchema(payloadSchema) ? payloadSchema : Schema.Struct(payloadSchema),
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      defectSchema: this.defectSchema,
      annotations: this.annotations,
      middlewares: this.middlewares
    });
  },
  middleware(middleware) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      defectSchema: this.defectSchema,
      annotations: this.annotations,
      middlewares: new Set([...this.middlewares, middleware])
    });
  },
  prefix(prefix) {
    return makeProto({
      _tag: `${prefix}${this._tag}`,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      defectSchema: this.defectSchema,
      annotations: this.annotations,
      middlewares: this.middlewares
    });
  },
  annotate(tag, value) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      defectSchema: this.defectSchema,
      middlewares: this.middlewares,
      annotations: Context.add(this.annotations, tag, value)
    });
  },
  annotateMerge(context) {
    return makeProto({
      _tag: this._tag,
      payloadSchema: this.payloadSchema,
      successSchema: this.successSchema,
      errorSchema: this.errorSchema,
      defectSchema: this.defectSchema,
      middlewares: this.middlewares,
      annotations: Context.merge(this.annotations, context)
    });
  }
};
const makeProto = options => {
  function Rpc() {}
  Object.setPrototypeOf(Rpc, Proto);
  Object.assign(Rpc, options);
  Rpc.key = `effect/rpc/Rpc/${options._tag}`;
  return Rpc;
};
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = (tag, options) => {
  const successSchema = options?.success ?? Schema.Void;
  const errorSchema = options?.error ?? Schema.Never;
  const defectSchema = options?.defect ?? Schema.Defect;
  let payloadSchema;
  if (options?.primaryKey) {
    payloadSchema = class Payload extends Schema.Class(`effect/rpc/Rpc/${tag}`)(options.payload) {
      [PrimaryKey.symbol]() {
        return options.primaryKey(this);
      }
    };
  } else {
    payloadSchema = Schema.isSchema(options?.payload) ? options?.payload : options?.payload ? Schema.Struct(options?.payload) : Schema.Void;
  }
  return makeProto({
    _tag: tag,
    payloadSchema,
    successSchema: options?.stream ? RpcSchema.Stream(successSchema, errorSchema) : successSchema,
    errorSchema: options?.stream ? Schema.Never : errorSchema,
    defectSchema,
    annotations: Context.empty(),
    middlewares: new Set()
  });
};
const exitSchemaCache = /*#__PURE__*/new WeakMap();
/**
 * @since 4.0.0
 * @category constructors
 */
export const exitSchema = self => {
  if (exitSchemaCache.has(self)) {
    return exitSchemaCache.get(self);
  }
  const rpc = self;
  const failures = new Set([rpc.errorSchema]);
  const streamSchemas = RpcSchema.getStreamSchemas(rpc.successSchema);
  if (Option.isSome(streamSchemas)) {
    failures.add(streamSchemas.value.error);
  }
  for (const middleware of rpc.middlewares) {
    failures.add(middleware.error);
  }
  const schema = Schema.Exit(Option.isSome(streamSchemas) ? Schema.Void : rpc.successSchema, Schema.Union([...failures]), rpc.defectSchema);
  exitSchemaCache.set(self, schema);
  return schema;
};
const WrapperTypeId = "~effect/rpc/Rpc/Wrapper";
/**
 * @since 4.0.0
 * @category Wrapper
 */
export const isWrapper = u => WrapperTypeId in u;
/**
 * @since 4.0.0
 * @category Wrapper
 */
export const wrap = options => value => isWrapper(value) ? {
  [WrapperTypeId]: WrapperTypeId,
  value: value.value,
  fork: options.fork ?? value.fork,
  uninterruptible: options.uninterruptible ?? value.uninterruptible
} : {
  [WrapperTypeId]: WrapperTypeId,
  value,
  fork: options.fork ?? false,
  uninterruptible: options.uninterruptible ?? false
};
/**
 * @since 4.0.0
 * @category Wrapper
 */
export const unwrap = value => isWrapper(value) ? value.value : value;
/**
 * @since 4.0.0
 * @category Wrapper
 */
export const wrapMap = (self, f) => {
  if (isWrapper(self)) {
    return wrap(self)(f(self.value));
  }
  return f(self);
};
/**
 * You can use `fork` to wrap a response Effect or Stream, to ensure that the
 * response is executed concurrently regardless of the RpcServer concurrency
 * setting.
 *
 * @since 4.0.0
 * @category Wrapper
 */
export const fork = /*#__PURE__*/wrap({
  fork: true
});
/**
 * You can use `uninterruptible` to wrap a response Effect or Stream, to ensure that it is run in an uninterruptible region.
 *
 * @since 4.0.0
 * @category Wrapper
 */
export const uninterruptible = /*#__PURE__*/wrap({
  uninterruptible: true
});
//# sourceMappingURL=Rpc.js.map