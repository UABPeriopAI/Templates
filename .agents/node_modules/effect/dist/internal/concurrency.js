import { CurrentConcurrency } from "../References.js";
import * as effect from "./effect.js";
/** @internal */
export const match = (concurrency, sequential, unbounded, bounded) => {
  switch (concurrency) {
    case undefined:
      return sequential();
    case "unbounded":
      return unbounded();
    case "inherit":
      return effect.flatMap(CurrentConcurrency.asEffect(), concurrency => concurrency === "unbounded" ? unbounded() : concurrency > 1 ? bounded(concurrency) : sequential());
    default:
      return concurrency > 1 ? bounded(concurrency) : sequential();
  }
};
/** @internal */
export const matchSimple = (concurrency, sequential, concurrent) => {
  switch (concurrency) {
    case undefined:
      return sequential();
    case "unbounded":
      return concurrent();
    case "inherit":
      return effect.flatMap(CurrentConcurrency.asEffect(), concurrency => concurrency === "unbounded" || concurrency > 1 ? concurrent() : sequential());
    default:
      return concurrency > 1 ? concurrent() : sequential();
  }
};
//# sourceMappingURL=concurrency.js.map