/**
 * @since 4.0.0
 */
import * as Cause from "../../Cause.js";
import * as Effect from "../../Effect.js";
import { hasProperty, isTagged } from "../../Predicate.js";
import * as Schema from "../../Schema.js";
import { EntityAddress } from "./EntityAddress.js";
import { RunnerAddress } from "./RunnerAddress.js";
import { SnowflakeFromString } from "./Snowflake.js";
const TypeId = "~effect/cluster/ClusterError";
/**
 * Represents an error that occurs when a Runner receives a message for an entity
 * that it is not assigned to it.
 *
 * @since 4.0.0
 * @category errors
 */
export class EntityNotAssignedToRunner extends /*#__PURE__*/Schema.ErrorClass(`${TypeId}/EntityNotAssignedToRunner`)({
  _tag: /*#__PURE__*/Schema.tag("EntityNotAssignedToRunner"),
  address: EntityAddress
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  static is(u) {
    return hasProperty(u, TypeId) && isTagged(u, "EntityNotAssignedToRunner");
  }
}
/**
 * Represents an error that occurs when a message fails to be properly
 * deserialized by an entity.
 *
 * @since 4.0.0
 * @category errors
 */
export class MalformedMessage extends /*#__PURE__*/Schema.ErrorClass(`${TypeId}/MalformedMessage`)({
  _tag: /*#__PURE__*/Schema.tag("MalformedMessage"),
  cause: Schema.Defect
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  static is(u) {
    return hasProperty(u, TypeId) && isTagged(u, "MalformedMessage");
  }
  /**
   * @since 4.0.0
   */
  static refail = /*#__PURE__*/Effect.mapError(cause => new MalformedMessage({
    cause
  }));
}
/**
 * Represents an error that occurs when a message fails to be persisted into
 * cluster's mailbox storage.
 *
 * @since 4.0.0
 * @category errors
 */
export class PersistenceError extends /*#__PURE__*/Schema.ErrorClass(`${TypeId}/PersistenceError`)({
  _tag: /*#__PURE__*/Schema.tag("PersistenceError"),
  cause: Schema.Defect
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  static refail(effect) {
    return Effect.catchCause(effect, cause => Effect.fail(new PersistenceError({
      cause: Cause.squash(cause)
    })));
  }
}
/**
 * Represents an error that occurs when a Runner is not registered with the shard
 * manager.
 *
 * @since 4.0.0
 * @category errors
 */
export class RunnerNotRegistered extends /*#__PURE__*/Schema.ErrorClass(`${TypeId}/RunnerNotRegistered`)({
  _tag: /*#__PURE__*/Schema.tag("RunnerNotRegistered"),
  address: RunnerAddress
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
}
/**
 * Represents an error that occurs when a Runner is unresponsive.
 *
 * @since 4.0.0
 * @category errors
 */
export class RunnerUnavailable extends /*#__PURE__*/Schema.ErrorClass(`${TypeId}/RunnerUnavailable`)({
  _tag: /*#__PURE__*/Schema.tag("RunnerUnavailable"),
  address: RunnerAddress
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  static is(u) {
    return hasProperty(u, TypeId) && isTagged(u, "RunnerUnavailable");
  }
}
/**
 * Represents an error that occurs when the entities mailbox is full.
 *
 * @since 4.0.0
 * @category errors
 */
export class MailboxFull extends /*#__PURE__*/Schema.ErrorClass(`${TypeId}/MailboxFull`)({
  _tag: /*#__PURE__*/Schema.tag("MailboxFull"),
  address: EntityAddress
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  static is(u) {
    return hasProperty(u, TypeId) && isTagged(u, "MailboxFull");
  }
}
/**
 * Represents an error that occurs when the entity is already processing a
 * request.
 *
 * @since 4.0.0
 * @category errors
 */
export class AlreadyProcessingMessage extends /*#__PURE__*/Schema.ErrorClass(`${TypeId}/AlreadyProcessingMessage`)({
  _tag: /*#__PURE__*/Schema.tag("AlreadyProcessingMessage"),
  envelopeId: SnowflakeFromString,
  address: EntityAddress
}) {
  /**
   * @since 4.0.0
   */
  [TypeId] = TypeId;
  /**
   * @since 4.0.0
   */
  static is(u) {
    return hasProperty(u, TypeId) && isTagged(u, "AlreadyProcessingMessage");
  }
}
//# sourceMappingURL=ClusterError.js.map