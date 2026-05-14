import * as Arr from "../../Array.js";
import * as Cause from "../../Cause.js";
import * as Channel from "../../Channel.js";
import * as ChannelSchema from "../../ChannelSchema.js";
import * as Data from "../../Data.js";
import * as Duration from "../../Duration.js";
import * as Effect from "../../Effect.js";
import { hasProperty } from "../../Predicate.js";
import * as Pull from "../../Pull.js";
import * as Result from "../../Result.js";
import * as Schema from "../../Schema.js";
import * as Transformation from "../../SchemaTransformation.js";
/**
 * @since 4.0.0
 * @category Decoding
 */
export const decode = () => Channel.fromTransform((upstream, _scope) => Effect.sync(() => {
  let buffer = [];
  let retry;
  const parser = makeParser(event => {
    if (event._tag === "Retry") {
      retry = event;
    } else {
      buffer.push(event);
    }
  });
  const pump = Effect.flatMap(upstream, arr => {
    for (let i = 0; i < arr.length; i++) {
      parser.feed(arr[i]);
    }
    return Effect.void;
  });
  return Effect.suspend(function loop() {
    if (Arr.isArrayNonEmpty(buffer)) {
      const out = buffer;
      buffer = [];
      return Effect.succeed(out);
    } else if (retry) {
      return Effect.fail(retry);
    }
    return Effect.flatMap(pump, loop);
  });
}));
/**
 * @since 4.0.0
 * @category Decoding
 */
export const decodeSchema = schema => Channel.pipeTo(decode(), ChannelSchema.decode(EventEncoded.pipe(Schema.decodeTo(schema)))());
/**
 * @since 4.0.0
 * @category Decoding
 */
export const decodeDataSchema = schema => {
  const eventSchema = Schema.Struct({
    ...EventEncoded.fields,
    data: Schema.fromJsonString(schema)
  });
  return Channel.pipeTo(decode(), ChannelSchema.decode(eventSchema)());
};
/**
 * Create a SSE parser.
 *
 * Adapted from https://github.com/rexxars/eventsource-parser under MIT license.
 *
 * @since 4.0.0
 * @category Decoding
 */
export function makeParser(onParse) {
  // Processing state
  let isFirstChunk;
  let buffer;
  let startingPosition;
  let startingFieldLength;
  // Event state
  let eventId;
  let lastEventId;
  let eventName;
  let data;
  reset();
  return {
    feed,
    reset
  };
  function reset() {
    isFirstChunk = true;
    buffer = "";
    startingPosition = 0;
    startingFieldLength = -1;
    eventId = undefined;
    eventName = undefined;
    data = "";
  }
  function feed(chunk) {
    buffer = buffer ? buffer + chunk : chunk;
    // Strip any UTF8 byte order mark (BOM) at the start of the stream.
    // Note that we do not strip any non - UTF8 BOM, as eventsource streams are
    // always decoded as UTF8 as per the specification.
    if (isFirstChunk && hasBom(buffer)) {
      buffer = buffer.slice(BOM.length);
    }
    isFirstChunk = false;
    // Set up chunk-specific processing state
    const length = buffer.length;
    let position = 0;
    let discardTrailingNewline = false;
    // Read the current buffer byte by byte
    while (position < length) {
      // EventSource allows for carriage return + line feed, which means we
      // need to ignore a linefeed character if the previous character was a
      // carriage return
      // @todo refactor to reduce nesting, consider checking previous byte?
      // @todo but consider multiple chunks etc
      if (discardTrailingNewline) {
        if (buffer[position] === "\n") {
          ++position;
        }
        discardTrailingNewline = false;
      }
      let lineLength = -1;
      let fieldLength = startingFieldLength;
      let character;
      for (let index = startingPosition; lineLength < 0 && index < length; ++index) {
        character = buffer[index];
        if (character === ":" && fieldLength < 0) {
          fieldLength = index - position;
        } else if (character === "\r") {
          discardTrailingNewline = true;
          lineLength = index - position;
        } else if (character === "\n") {
          lineLength = index - position;
        }
      }
      if (lineLength < 0) {
        startingPosition = length - position;
        startingFieldLength = fieldLength;
        break;
      } else {
        startingPosition = 0;
        startingFieldLength = -1;
      }
      parseEventStreamLine(buffer, position, fieldLength, lineLength);
      position += lineLength + 1;
    }
    if (position === length) {
      // If we consumed the entire buffer to read the event, reset the buffer
      buffer = "";
    } else if (position > 0) {
      // If there are bytes left to process, set the buffer to the unprocessed
      // portion of the buffer only
      buffer = buffer.slice(position);
    }
  }
  function parseEventStreamLine(lineBuffer, index, fieldLength, lineLength) {
    if (lineLength === 0) {
      // We reached the last line of this event
      if (data.length > 0) {
        onParse({
          _tag: "Event",
          id: eventId,
          event: eventName ?? "message",
          data: data.slice(0, -1) // remove trailing newline
        });
        data = "";
        eventId = undefined;
      }
      eventName = undefined;
      return;
    }
    const noValue = fieldLength < 0;
    const field = lineBuffer.slice(index, index + (noValue ? lineLength : fieldLength));
    let step = 0;
    if (noValue) {
      step = lineLength;
    } else if (lineBuffer[index + fieldLength + 1] === " ") {
      step = fieldLength + 2;
    } else {
      step = fieldLength + 1;
    }
    const position = index + step;
    const valueLength = lineLength - step;
    const value = lineBuffer.slice(position, position + valueLength).toString();
    if (field === "data") {
      data += value ? `${value}\n` : "\n";
    } else if (field === "event") {
      eventName = value;
    } else if (field === "id" && !value.includes("\u0000")) {
      eventId = value;
      lastEventId = value;
    } else if (field === "retry") {
      const retry = parseInt(value, 10);
      if (!Number.isNaN(retry)) {
        onParse(new Retry({
          duration: Duration.millis(retry),
          lastEventId
        }));
      }
    }
  }
}
const BOM = [239, 187, 191];
function hasBom(buffer) {
  return BOM.every((charCode, index) => buffer.charCodeAt(index) === charCode);
}
/**
 * @since 4.0.0
 * @category Encoding
 */
export const encode = () => Channel.fromTransform((upstream, _scope) => Effect.sync(() => {
  let done = false;
  const pull = upstream.pipe(Effect.map(Arr.map(encoder.write)), Effect.catchFilter(Retry.filter, retry => {
    done = true;
    return Effect.succeed(Arr.of(encoder.write(retry)));
  }), Pull.catchDone(() => Cause.done()));
  return Effect.suspend(() => done ? Cause.done() : pull);
}));
/**
 * @since 4.0.0
 * @category Encoding
 */
export const encodeSchema = schema => ChannelSchema.encode(Event.pipe(Schema.decodeTo(schema, transformEvent)))().pipe(Channel.pipeTo(encode()));
/**
 * @since 4.0.0
 * @category Models
 */
export const EventEncoded = /*#__PURE__*/Schema.Struct({
  id: /*#__PURE__*/Schema.UndefinedOr(Schema.String),
  event: Schema.String,
  data: Schema.String
});
/**
 * @since 4.0.0
 * @category Models
 */
export const Event = /*#__PURE__*/Schema.Struct({
  _tag: /*#__PURE__*/Schema.tag("Event"),
  id: /*#__PURE__*/Schema.UndefinedOr(Schema.String),
  event: Schema.String,
  data: Schema.String
});
/**
 * @since 4.0.0
 * @category Models
 */
export const transformEvent = /*#__PURE__*/Transformation.transform({
  decode: event => event,
  encode: event => ({
    _tag: "Event",
    id: event.id,
    event: event.event,
    data: event.data
  })
});
const RetryTypeId = "~effect/encoding/Sse/Retry";
/**
 * @since 4.0.0
 * @category Models
 */
export class Retry extends /*#__PURE__*/Data.TaggedClass("Retry") {
  /**
   * @since 4.0.0
   */
  [RetryTypeId] = RetryTypeId;
  /**
   * @since 4.0.0
   */
  static is(u) {
    return hasProperty(u, RetryTypeId);
  }
  /**
   * @since 4.0.0
   */
  static filter(u) {
    return Retry.is(u) ? Result.succeed(u) : Result.fail(u);
  }
}
/**
 * @since 4.0.0
 * @category Encoding
 */
export const encoder = {
  write(event) {
    switch (event._tag) {
      case "Event":
        {
          let data = "";
          if (event.id !== undefined) {
            data += `id: ${event.id}\n`;
          }
          if (event.event !== "message") {
            data += `event: ${event.event}\n`;
          }
          if (event.data !== "") {
            data += `data: ${event.data.replace(/\n/g, "\ndata: ")}\n`;
          }
          return data + "\n";
        }
      case "Retry":
        {
          return `retry: ${Duration.toMillis(event.duration)}\n\n`;
        }
    }
  }
};
//# sourceMappingURL=Sse.js.map