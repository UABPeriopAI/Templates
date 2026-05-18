import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as Option from "../../Option.js";
import { hasProperty } from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import * as Issue from "../../SchemaIssue.js";
import * as Parser from "../../SchemaParser.js";
import * as Transformation from "../../SchemaTransformation.js";
import * as Rpc from "../rpc/Rpc.js";
import { MalformedMessage } from "./ClusterError.js";
import { Snowflake, SnowflakeFromBigInt } from "./Snowflake.js";
const TypeId = "~effect/cluster/Reply";
/**
 * @since 4.0.0
 * @category guards
 */
export const isReply = u => hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category models
 */
export const Encoded = Schema.Any;
/**
 * @since 4.0.0
 * @category models
 */
export class ReplyWithContext extends /*#__PURE__*/Data.TaggedClass("ReplyWithContext") {
  /**
   * @since 4.0.0
   */
  static fromDefect(options) {
    return new ReplyWithContext({
      reply: new WithExit({
        requestId: options.requestId,
        id: options.id,
        exit: Exit.die(Schema.encodeSync(Schema.Defect)(options.defect))
      }),
      context: Context.empty(),
      rpc: neverRpc
    });
  }
  /**
   * @since 4.0.0
   */
  static interrupt(options) {
    return new ReplyWithContext({
      reply: new WithExit({
        requestId: options.requestId,
        id: options.id,
        exit: Exit.interrupt()
      }),
      context: Context.empty(),
      rpc: neverRpc
    });
  }
}
const neverRpc = /*#__PURE__*/Rpc.make("Never", {
  success: Schema.Never,
  error: Schema.Never,
  payload: {}
});
const schemaCache = /*#__PURE__*/new WeakMap();
/**
 * @since 4.0.0
 * @category models
 */
export class Chunk extends /*#__PURE__*/Data.TaggedClass("Chunk") {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  static emptyFrom(requestId) {
    return new Chunk({
      requestId,
      id: Snowflake(BigInt(0)),
      sequence: 0,
      values: [undefined]
    });
  }
  /**
   * @since 4.0.0
   */
  static Any = /*#__PURE__*/Schema.declare(u => isReply(u) && u._tag === "Chunk");
  /**
   * @since 4.0.0
   */
  static transform = /*#__PURE__*/Transformation.transform({
    decode: a => new Chunk(a),
    encode: a => a
  });
  /**
   * @since 4.0.0
   */
  static schema(rpc) {
    const successSchema = rpc.successSchema.success;
    if (!successSchema) {
      return Schema.Never;
    }
    return this.schemaFrom(successSchema);
  }
  /**
   * @since 4.0.0
   */
  static schemaFrom(success) {
    // TODO: extract to a helper function
    return Schema.declareConstructor()([success], ([success]) => (input, ast, options) => {
      if (!isReply(input) || input._tag !== "Chunk") {
        return Effect.fail(new Issue.InvalidType(ast, Option.some(input)));
      }
      return Effect.mapBothEager(Parser.decodeEffect(Schema.NonEmptyArray(success))(input.values, options), {
        onFailure: issue => new Issue.Composite(ast, Option.some(input), [new Issue.Pointer(["values"], issue)]),
        onSuccess: values => new Chunk({
          ...input,
          values
        })
      });
    }, {
      expected: "Reply.Chunk",
      toCodecJson: ([success]) => Schema.link()(Schema.Struct({
        _tag: Schema.Literal("Chunk"),
        requestId: SnowflakeFromBigInt,
        id: SnowflakeFromBigInt,
        sequence: Schema.Number,
        values: Schema.NonEmptyArray(success)
      }), Transformation.transform({
        decode: encoded => new Chunk(encoded),
        encode: result => ({
          ...result
        })
      }))
    });
  }
  /**
   * @since 4.0.0
   */
  withRequestId(requestId) {
    return new Chunk({
      ...this,
      requestId
    });
  }
}
/**
 * @since 4.0.0
 * @category models
 */
export class WithExit extends /*#__PURE__*/Data.TaggedClass("WithExit") {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  static is(u) {
    return isReply(u) && u._tag === "WithExit";
  }
  /**
   * @since 4.0.0
   */
  static schema(rpc) {
    return this.schemaFrom(Rpc.exitSchema(rpc));
  }
  /**
   * @since 4.0.0
   */
  static schemaFrom(exitSchema) {
    // TODO: extract to a helper function
    return Schema.declareConstructor()([exitSchema], ([exit]) => (input, ast, options) => {
      if (!isReply(input) || input._tag !== "WithExit") {
        return Effect.fail(new Issue.InvalidType(ast, Option.some(input)));
      }
      return Effect.mapBothEager(Parser.decodeEffect(exit)(input.exit, options), {
        onFailure: issue => new Issue.Composite(ast, Option.some(input), [new Issue.Pointer(["exit"], issue)]),
        onSuccess: exit => new WithExit({
          ...input,
          exit: exit
        })
      });
    }, {
      expected: "Reply.WithExit",
      toCodecJson: ([exit]) => Schema.link()(Schema.Struct({
        _tag: Schema.Literal("WithExit"),
        requestId: SnowflakeFromBigInt,
        id: SnowflakeFromBigInt,
        exit
      }), Transformation.transform({
        decode: encoded => new WithExit(encoded),
        encode: result => ({
          ...result
        })
      }))
    });
  }
  /**
   * @since 4.0.0
   */
  withRequestId(requestId) {
    return new WithExit({
      ...this,
      requestId
    });
  }
}
/**
 * @since 4.0.0
 * @category schemas
 */
export const Reply = rpc => {
  if (schemaCache.has(rpc)) {
    return schemaCache.get(rpc);
  }
  const schema = Schema.toCodecJson(Schema.Union([WithExit.schema(rpc), Chunk.schema(rpc)]));
  schemaCache.set(rpc, schema);
  return schema;
};
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export const serialize = self => {
  const schema = Reply(self.rpc);
  return MalformedMessage.refail(Effect.provideContext(Schema.encodeEffect(schema)(self.reply), self.context));
};
/**
 * @since 4.0.0
 * @category serialization / deserialization
 */
export const serializeLastReceived = self => {
  const lastReceivedReply = self.lastReceivedReply;
  if (lastReceivedReply._tag === "None") {
    return Effect.succeedNone;
  }
  const schema = Reply(self.rpc);
  return MalformedMessage.refail(Effect.provideContext(Schema.encodeEffect(schema)(lastReceivedReply.value), self.context)).pipe(Effect.map(Option.some));
};
//# sourceMappingURL=Reply.js.map