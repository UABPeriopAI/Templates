import { Clock } from "../../Clock.js";
import * as Context from "../../Context.js";
import * as DateTime from "../../DateTime.js";
import * as Effect from "../../Effect.js";
import { identity } from "../../Function.js";
import * as Layer from "../../Layer.js";
import * as Schema from "../../Schema.js";
import * as Transformation from "../../SchemaTransformation.js";
/**
 * @since 4.0.0
 */
export const TypeId = "~effect/cluster/Snowflake";
/**
 * @since 4.0.0
 * @category Models
 */
export const Snowflake = input => typeof input === "string" ? BigInt(input) : input;
/**
 * @since 4.0.0
 * @category Schemas
 */
export const SnowflakeFromBigInt = /*#__PURE__*/Schema.BigInt.pipe(/*#__PURE__*/Schema.brand(TypeId));
/**
 * @since 4.0.0
 * @category Schemas
 */
export const SnowflakeFromString = /*#__PURE__*/Schema.String.pipe(/*#__PURE__*/Schema.decodeTo(SnowflakeFromBigInt, Transformation.bigintFromString));
/**
 * @since 4.0.0
 * @category Epoch
 */
export const constEpochMillis = /*#__PURE__*/Date.UTC(2025, 0, 1);
const sinceUnixEpoch = constEpochMillis - /*#__PURE__*/Date.UTC(1970, 0, 1);
const constBigInt12 = /*#__PURE__*/BigInt(12);
const constBigInt22 = /*#__PURE__*/BigInt(22);
const constBigInt1024 = /*#__PURE__*/BigInt(1024);
const constBigInt4096 = /*#__PURE__*/BigInt(4096);
/**
 * @since 4.0.0
 * @category constructors
 */
export const make = options => BigInt(options.timestamp - constEpochMillis) << constBigInt22 | BigInt(options.machineId % 1024) << constBigInt12 | BigInt(options.sequence % 4096);
/**
 * @since 4.0.0
 * @category Parts
 */
export const timestamp = snowflake => Number(snowflake >> constBigInt22) + sinceUnixEpoch;
/**
 * @since 4.0.0
 * @category Parts
 */
export const dateTime = snowflake => DateTime.makeUnsafe(timestamp(snowflake));
/**
 * @since 4.0.0
 * @category Parts
 */
export const machineId = snowflake => Number((snowflake >> constBigInt12) % constBigInt1024);
/**
 * @since 4.0.0
 * @category Parts
 */
export const sequence = snowflake => Number(snowflake % constBigInt4096);
/**
 * @since 4.0.0
 * @category Parts
 */
export const toParts = snowflake => ({
  timestamp: timestamp(snowflake),
  machineId: machineId(snowflake),
  sequence: sequence(snowflake)
});
/**
 * @since 4.0.0
 * @category Generator
 */
export const makeGenerator = /*#__PURE__*/Effect.gen(function* () {
  let machineId = Math.floor(Math.random() * 1024);
  const clock = yield* Clock;
  let sequence = 0;
  let sequenceAt = Math.floor(clock.currentTimeMillisUnsafe());
  return identity({
    setMachineId: newMachineId => Effect.sync(() => {
      machineId = newMachineId;
    }),
    nextUnsafe() {
      let now = Math.floor(clock.currentTimeMillisUnsafe());
      // account for clock drift, only allow time to move forward
      if (now < sequenceAt) {
        now = sequenceAt;
      } else if (now > sequenceAt) {
        // reset sequence if we're in a new millisecond
        sequence = 0;
        sequenceAt = now;
      } else if (sequence >= 4096) {
        // if we've hit the max sequence for this millisecond, go to the next
        // millisecond
        sequenceAt++;
        sequence = 0;
      }
      return make({
        machineId,
        sequence: sequence++,
        timestamp: sequenceAt
      });
    }
  });
});
/**
 * @since 4.0.0
 * @category Generator
 */
export class Generator extends /*#__PURE__*/Context.Service()("effect/cluster/Snowflake/Generator") {}
/**
 * @since 4.0.0
 * @category Generator
 */
export const layerGenerator = /*#__PURE__*/Layer.effect(Generator)(makeGenerator);
//# sourceMappingURL=Snowflake.js.map