/**
 * @since 4.0.0
 */
import * as Arr from "../../Array.js";
import * as Cause from "../../Cause.js";
import * as Channel from "../../Channel.js";
import * as Context from "../../Context.js";
import * as Data from "../../Data.js";
import * as Effect from "../../Effect.js";
import * as Exit from "../../Exit.js";
import * as FileSystem from "../../FileSystem.js";
import { constant, dual } from "../../Function.js";
import * as Inspectable from "../../Inspectable.js";
import * as Option from "../../Option.js";
import * as Path from "../../Path.js";
import * as Predicate from "../../Predicate.js";
import * as Pull from "../../Pull.js";
import * as Schema from "../../Schema.js";
import * as Transformation from "../../SchemaTransformation.js";
import * as Stream from "../../Stream.js";
import * as UndefinedOr from "../../UndefinedOr.js";
import * as IncomingMessage from "./HttpIncomingMessage.js";
import * as MP from "./Multipasta.js";
/**
 * @since 4.0.0
 */
export const TypeId = "~effect/http/Multipart";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isPart = u => Predicate.hasProperty(u, TypeId);
/**
 * @since 4.0.0
 * @category Guards
 */
export const isField = u => isPart(u) && u._tag === "Field";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isFile = u => isPart(u) && u._tag === "File";
/**
 * @since 4.0.0
 * @category Guards
 */
export const isPersistedFile = u => Predicate.hasProperty(u, TypeId) && Predicate.isTagged(u, "PersistedFile");
const MultipartErrorTypeId = "~effect/http/Multipart/MultipartError";
/**
 * @since 4.0.0
 * @category Errors
 */
export class MultipartErrorReason extends Data.Error {}
/**
 * @since 4.0.0
 * @category Errors
 */
export class MultipartError extends /*#__PURE__*/Data.TaggedError("MultipartError") {
  /**
   * @since 4.0.0
   */
  static fromReason(reason, cause) {
    return new MultipartError({
      reason: new MultipartErrorReason({
        _tag: reason,
        cause
      })
    });
  }
  /**
   * @since 4.0.0
   */
  [MultipartErrorTypeId] = MultipartErrorTypeId;
  /**
   * @since 4.0.0
   */
  get message() {
    return this.reason._tag;
  }
}
/**
 * @since 4.0.0
 * @category Schemas
 */
export const PersistedFileSchema = /*#__PURE__*/Schema.declare(isPersistedFile, {
  typeConstructor: {
    _tag: "effect/http/PersistedFile"
  },
  generation: {
    runtime: `Multipart.PersistedFileSchema`,
    Type: `Multipart.PersistedFile`,
    importDeclaration: `import * as Multipart from "effect/unstable/http/Multipart"`
  },
  expected: "PersistedFile",
  toCodecJson: () => Schema.link()(Schema.Struct({
    key: Schema.String,
    name: Schema.String,
    contentType: Schema.String.annotate({
      contentEncoding: "binary"
    }),
    path: Schema.String
  }), Transformation.transform({
    decode: ({
      contentType,
      key,
      name,
      path
    }) => new PersistedFileImpl(key, name, contentType, path),
    encode: file => ({
      key: file.key,
      name: file.name,
      contentType: file.contentType,
      path: file.path
    })
  }))
});
/**
 * @since 4.0.0
 * @category Schemas
 */
export const FilesSchema = /*#__PURE__*/Schema.Array(PersistedFileSchema);
/**
 * @since 4.0.0
 * @category Schemas
 */
export const SingleFileSchema = /*#__PURE__*/FilesSchema.check(Schema.isLengthBetween(1, 1)).pipe(/*#__PURE__*/Schema.decodeTo(PersistedFileSchema, /*#__PURE__*/Transformation.transform({
  decode: ([file]) => file,
  encode: file => [file]
})));
/**
 * @since 4.0.0
 * @category Schemas
 */
export const schemaPersisted = schema => Schema.decodeUnknownEffect(schema);
/**
 * @since 4.0.0
 * @category Schemas
 */
export const schemaJson = (schema, options) => {
  const fromJson = Schema.fromJsonString(schema);
  return dual(2, (persisted, field) => Effect.map(Schema.decodeUnknownEffect(Schema.Struct({
    [field]: fromJson
  }))(persisted, options), _ => _[field]));
};
/**
 * @since 4.0.0
 * @category Config
 */
export const makeConfig = headers => Effect.withFiber(fiber => {
  const mimeTypes = Context.get(fiber.context, FieldMimeTypes);
  return Effect.succeed({
    headers,
    maxParts: fiber.getRef(MaxParts),
    maxFieldSize: Number(fiber.getRef(MaxFieldSize)),
    maxPartSize: UndefinedOr.map(fiber.getRef(MaxFileSize), Number),
    maxTotalSize: UndefinedOr.map(fiber.getRef(IncomingMessage.MaxBodySize), Number),
    isFile: mimeTypes.length === 0 ? undefined : info => !mimeTypes.some(_ => info.contentType.includes(_)) && MP.defaultIsFile(info)
  });
});
/**
 * @since 4.0.0
 * @category Parsers
 */
export const makeChannel = headers => Channel.fromTransform(upstream => Effect.map(makeConfig(headers), config => {
  let partsBuffer = [];
  let exit = Option.none();
  const parser = MP.make({
    ...config,
    onField(info, value) {
      partsBuffer.push(new FieldImpl(info.name, info.contentType, MP.decodeField(info, value)));
    },
    onFile(info) {
      let chunks = [];
      let finished = false;
      const pullChunks = Channel.fromPull(Effect.succeed(Effect.suspend(function loop() {
        if (!Arr.isReadonlyArrayNonEmpty(chunks)) {
          return finished ? Cause.done() : Effect.flatMap(pump, loop);
        }
        const chunk = chunks;
        chunks = [];
        return Effect.succeed(chunk);
      })));
      partsBuffer.push(new FileImpl(info, pullChunks));
      return function (chunk) {
        if (chunk === null) {
          finished = true;
        } else {
          chunks.push(chunk);
        }
      };
    },
    onError(error_) {
      exit = Option.some(Exit.fail(convertError(error_)));
    },
    onDone() {
      exit = Option.some(Exit.fail(Cause.Done()));
    }
  });
  const pump = upstream.pipe(Effect.flatMap(chunk => {
    for (let i = 0; i < chunk.length; i++) {
      parser.write(chunk[i]);
    }
    return Effect.void;
  }), Effect.catchCause(cause => {
    if (Pull.isDoneCause(cause)) {
      parser.end();
    } else {
      exit = Option.some(Exit.failCause(cause));
    }
    return Effect.void;
  }));
  return pump.pipe(Effect.flatMap(function loop() {
    if (!Arr.isReadonlyArrayNonEmpty(partsBuffer)) {
      if (Option.isSome(exit)) {
        return exit.value;
      }
      return Effect.flatMap(pump, loop);
    }
    const parts = partsBuffer;
    partsBuffer = [];
    return Effect.succeed(parts);
  }));
}));
function convertError(cause) {
  switch (cause._tag) {
    case "ReachedLimit":
      {
        switch (cause.limit) {
          case "MaxParts":
            {
              return MultipartError.fromReason("TooManyParts", cause);
            }
          case "MaxFieldSize":
            {
              return MultipartError.fromReason("FieldTooLarge", cause);
            }
          case "MaxPartSize":
            {
              return MultipartError.fromReason("FileTooLarge", cause);
            }
          case "MaxTotalSize":
            {
              return MultipartError.fromReason("BodyTooLarge", cause);
            }
        }
      }
    default:
      {
        return MultipartError.fromReason("Parse", cause);
      }
  }
}
class PartBase extends Inspectable.Class {
  [TypeId];
  constructor() {
    super();
    this[TypeId] = TypeId;
  }
}
class FieldImpl extends PartBase {
  _tag = "Field";
  key;
  contentType;
  value;
  constructor(key, contentType, value) {
    super();
    this.key = key;
    this.contentType = contentType;
    this.value = value;
  }
  toJSON() {
    return {
      _id: "@effect/platform/Multipart/Part",
      _tag: "Field",
      key: this.key,
      contentType: this.contentType,
      value: this.value
    };
  }
}
class FileImpl extends PartBase {
  _tag = "File";
  key;
  name;
  contentType;
  content;
  contentEffect;
  constructor(info, channel) {
    super();
    this.key = info.name;
    this.name = info.filename ?? info.name;
    this.contentType = info.contentType;
    this.content = Stream.fromChannel(channel);
    this.contentEffect = channel.pipe(collectUint8Array, Effect.mapError(cause => MultipartError.fromReason("InternalError", cause)));
  }
  toJSON() {
    return {
      _id: "@effect/platform/Multipart/Part",
      _tag: "File",
      key: this.key,
      name: this.name,
      contentType: this.contentType
    };
  }
}
const defaultWriteFile = (path, file) => Effect.flatMap(FileSystem.FileSystem.asEffect(), fs => Effect.mapError(Stream.run(file.content, fs.sink(path)), cause => MultipartError.fromReason("InternalError", cause)));
/**
 * @since 4.0.0
 */
export const collectUint8Array = self => Channel.runFold(self, constant(new Uint8Array(0)), (accumulator, chunk) => {
  const totalLength = chunk.reduce((sum, element) => sum + element.length, accumulator.length);
  const newAccumulator = new Uint8Array(totalLength);
  newAccumulator.set(accumulator, 0);
  let offset = accumulator.length;
  for (const element of chunk) {
    newAccumulator.set(element, offset);
    offset += element.length;
  }
  return newAccumulator;
});
/**
 * @since 4.0.0
 * @category Conversions
 */
export const toPersisted = (stream, writeFile = defaultWriteFile) => Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path_ = yield* Path.Path;
  const dir = yield* fs.makeTempDirectoryScoped();
  const persisted = Object.create(null);
  yield* Stream.runForEach(stream, part => {
    if (part._tag === "Field") {
      if (!(part.key in persisted)) {
        persisted[part.key] = part.value;
      } else if (typeof persisted[part.key] === "string") {
        persisted[part.key] = [persisted[part.key], part.value];
      } else {
        ;
        persisted[part.key].push(part.value);
      }
      return Effect.void;
    } else if (part.name === "") {
      return Effect.void;
    }
    const file = part;
    const path = path_.join(dir, path_.basename(file.name).slice(-128));
    const filePart = new PersistedFileImpl(file.key, file.name, file.contentType, path);
    if (Array.isArray(persisted[part.key])) {
      ;
      persisted[part.key].push(filePart);
    } else {
      persisted[part.key] = [filePart];
    }
    return writeFile(path, file);
  });
  return persisted;
}).pipe(Effect.catchTag("PlatformError", cause => Effect.fail(MultipartError.fromReason("InternalError", cause))));
class PersistedFileImpl extends PartBase {
  _tag = "PersistedFile";
  key;
  name;
  contentType;
  path;
  constructor(key, name, contentType, path) {
    super();
    this.key = key;
    this.name = name;
    this.contentType = contentType;
    this.path = path;
  }
  toJSON() {
    return {
      _id: "@effect/platform/Multipart/Part",
      _tag: "PersistedFile",
      key: this.key,
      name: this.name,
      contentType: this.contentType,
      path: this.path
    };
  }
}
/**
 * @since 4.0.0
 * @category References
 */
export const limitsServices = options => {
  const map = new Map();
  if (options.maxParts !== undefined) {
    map.set(MaxParts.key, options.maxParts);
  }
  if (options.maxFieldSize !== undefined) {
    map.set(MaxFieldSize.key, FileSystem.Size(options.maxFieldSize));
  }
  if (options.maxFileSize !== undefined) {
    map.set(MaxFileSize.key, UndefinedOr.map(options.maxFileSize, FileSystem.Size));
  }
  if (options.maxTotalSize !== undefined) {
    map.set(IncomingMessage.MaxBodySize.key, UndefinedOr.map(options.maxTotalSize, FileSystem.Size));
  }
  if (options.fieldMimeTypes !== undefined) {
    map.set(FieldMimeTypes.key, options.fieldMimeTypes);
  }
  return Context.makeUnsafe(map);
};
/**
 * @since 4.0.0
 * @category References
 */
export const MaxParts = /*#__PURE__*/Context.Reference("effect/http/Multipart/MaxParts", {
  defaultValue: () => undefined
});
/**
 * @since 4.0.0
 * @category References
 */
export const MaxFieldSize = /*#__PURE__*/Context.Reference("effect/http/Multipart/MaxFieldSize", {
  defaultValue: /*#__PURE__*/constant(/*#__PURE__*/FileSystem.Size(10 * 1024 * 1024))
});
/**
 * @since 4.0.0
 * @category References
 */
export const MaxFileSize = /*#__PURE__*/Context.Reference("effect/http/Multipart/MaxFileSize", {
  defaultValue: () => undefined
});
/**
 * @since 4.0.0
 * @category References
 */
export const FieldMimeTypes = /*#__PURE__*/Context.Reference("effect/http/Multipart/FieldMimeTypes", {
  defaultValue: /*#__PURE__*/constant(["application/json"])
});
//# sourceMappingURL=Multipart.js.map