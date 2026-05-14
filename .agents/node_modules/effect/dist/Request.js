import * as Equal from "./Equal.js";
import { dual } from "./Function.js";
import * as core from "./internal/core.js";
import * as internalEffect from "./internal/effect.js";
import { hasProperty } from "./Predicate.js";
const TypeId = "~effect/Request";
const requestVariance = /*#__PURE__*/Equal.byReferenceUnsafe({
  /* c8 ignore next */
  _E: _ => _,
  /* c8 ignore next */
  _A: _ => _,
  /* c8 ignore next */
  _R: _ => _
});
/**
 * @since 4.0.0
 */
export const RequestPrototype = {
  ...core.StructuralProto,
  [TypeId]: requestVariance
};
/**
 * Tests if a value is a `Request`.
 *
 * @example
 * ```ts
 * import { Request } from "effect"
 *
 * declare const User: unique symbol
 * declare const UserNotFound: unique symbol
 * type User = typeof User
 * type UserNotFound = typeof UserNotFound
 *
 * interface GetUser extends Request.Request<User, UserNotFound> {
 *   readonly _tag: "GetUser"
 *   readonly id: string
 * }
 * const GetUser = Request.tagged<GetUser>("GetUser")
 *
 * const request = GetUser({ id: "123" })
 * console.log(Request.isRequest(request)) // true
 * console.log(Request.isRequest("not a request")) // false
 * ```
 *
 * @category guards
 * @since 2.0.0
 */
export const isRequest = u => hasProperty(u, TypeId);
/**
 * Creates a constructor function for a specific Request type.
 *
 * @example
 * ```ts
 * import { Request } from "effect"
 *
 * declare const UserProfile: unique symbol
 * declare const ProfileError: unique symbol
 * type UserProfile = typeof UserProfile
 * type ProfileError = typeof ProfileError
 *
 * interface GetUserProfile extends Request.Request<UserProfile, ProfileError> {
 *   readonly id: string
 *   readonly includeSettings: boolean
 * }
 *
 * const GetUserProfile = Request.of<GetUserProfile>()
 *
 * const request = GetUserProfile({
 *   id: "user-123",
 *   includeSettings: true
 * })
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const of = () => args => Object.assign(Object.create(RequestPrototype), args);
/**
 * Creates a constructor function for a tagged Request type. The tag is automatically
 * added to the request, making it useful for discriminated unions.
 *
 * @example
 * ```ts
 * import { Request } from "effect"
 *
 * declare const User: unique symbol
 * declare const UserNotFound: unique symbol
 * declare const Post: unique symbol
 * declare const PostNotFound: unique symbol
 * type User = typeof User
 * type UserNotFound = typeof UserNotFound
 * type Post = typeof Post
 * type PostNotFound = typeof PostNotFound
 *
 * interface GetUser extends Request.Request<User, UserNotFound> {
 *   readonly _tag: "GetUser"
 *   readonly id: string
 * }
 *
 * interface GetPost extends Request.Request<Post, PostNotFound> {
 *   readonly _tag: "GetPost"
 *   readonly id: string
 * }
 *
 * const GetUser = Request.tagged<GetUser>("GetUser")
 * const GetPost = Request.tagged<GetPost>("GetPost")
 *
 * const userRequest = GetUser({ id: "user-123" })
 * const postRequest = GetPost({ id: "post-456" })
 *
 * // _tag is automatically set
 * console.log(userRequest._tag) // "GetUser"
 * console.log(postRequest._tag) // "GetPost"
 * ```
 *
 * @category constructors
 * @since 2.0.0
 */
export const tagged = tag => args => {
  const request = Object.create(RequestPrototype);
  if (args) Object.assign(request, args);
  request._tag = tag;
  return request;
};
/**
 * @example
 * ```ts
 * import { Request } from "effect"
 *
 * class GetUser extends Request.Class<{ id: number }, string, Error> {
 *   constructor(readonly id: number) {
 *     super({ id })
 *   }
 * }
 *
 * const getUserRequest = new GetUser(123)
 * console.log(getUserRequest.id) // 123
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const Class = /*#__PURE__*/function () {
  function Class(args) {
    if (args) {
      Object.assign(this, args);
    }
  }
  Class.prototype = RequestPrototype;
  return Class;
}();
/**
 * @example
 * ```ts
 * import { Request } from "effect"
 *
 * class GetUserById
 *   extends Request.TaggedClass("GetUserById")<{ id: number }, string, Error>
 * {}
 *
 * const request = new GetUserById({ id: 123 })
 * console.log(request._tag) // "GetUserById"
 * console.log(request.id) // 123
 * ```
 *
 * @since 2.0.0
 * @category constructors
 */
export const TaggedClass = tag => {
  return class TaggedClass extends Class {
    _tag = tag;
  };
};
/**
 * Completes a request entry with the provided result. This is typically used
 * within RequestResolver implementations to fulfill pending requests.
 *
 * @category completion
 * @since 2.0.0
 */
export const complete = /*#__PURE__*/dual(2, (self, result) => internalEffect.sync(() => self.completeUnsafe(result)));
/**
 * @since 2.0.0
 * @category completion
 */
export const completeEffect = /*#__PURE__*/dual(2, (self, effect) => internalEffect.matchEffect(effect, {
  onFailure: error => complete(self, core.exitFail(error)),
  onSuccess: value => complete(self, core.exitSucceed(value))
}));
/**
 * @since 2.0.0
 * @category completion
 */
export const fail = /*#__PURE__*/dual(2, (self, error) => complete(self, core.exitFail(error)));
/**
 * @since 2.0.0
 * @category completion
 */
export const failCause = /*#__PURE__*/dual(2, (self, cause) => complete(self, core.exitFailCause(cause)));
/**
 * @since 2.0.0
 * @category completion
 */
export const succeed = /*#__PURE__*/dual(2, (self, value) => complete(self, core.exitSucceed(value)));
/**
 * @since 2.0.0
 * @category entry
 */
export const makeEntry = options => options;
//# sourceMappingURL=Request.js.map