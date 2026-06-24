import * as Array from "../../Array.js";
import * as Boolean from "../../Boolean.js";
import { memoize } from "../../Function.js";
import * as Number from "../../Number.js";
import * as Option from "../../Option.js";
import * as Predicate from "../../Predicate.js";
import * as AST from "../../SchemaAST.js";
import * as Struct from "../../Struct.js";
import * as UndefinedOr from "../../UndefinedOr.js";
import { errorWithPath } from "../errors.js";
import * as InternalAnnotations from "./annotations.js";
const arbitraryMemoMap = /*#__PURE__*/new WeakMap();
function applyChecks(ast, filters, arbitrary) {
  return filters.map(filter => a => filter.run(a, ast, AST.defaultParseOptions) === undefined).reduce((acc, filter) => acc.filter(filter), arbitrary);
}
function isUniqueArrayConstraintsCustomCompare(constraint) {
  return constraint?.comparator !== undefined;
}
function array(fc, ctx, item) {
  const constraint = ctx.constraints?.array;
  const out = isUniqueArrayConstraintsCustomCompare(constraint) ? fc.uniqueArray(item, constraint) : fc.array(item, constraint);
  if (ctx.isSuspend) {
    return fc.oneof({
      maxDepth: 2,
      depthIdentifier: ""
    }, fc.constant([]), out);
  }
  return out;
}
const max = /*#__PURE__*/UndefinedOr.makeReducer(Number.ReducerMax);
const min = /*#__PURE__*/UndefinedOr.makeReducer(Number.ReducerMin);
const or = /*#__PURE__*/UndefinedOr.makeReducer(Boolean.ReducerOr);
const concat = /*#__PURE__*/UndefinedOr.makeReducer(/*#__PURE__*/Array.makeReducerConcat());
const combiner = /*#__PURE__*/Struct.makeCombiner({
  isInteger: or,
  max: min,
  maxExcluded: or,
  maxLength: min,
  min: max,
  minExcluded: or,
  minLength: max,
  noDefaultInfinity: or,
  noInteger: or,
  noInvalidDate: or,
  noNaN: or,
  patterns: concat,
  comparator: or
}, {
  omitKeyWhen: Predicate.isUndefined
});
function merge(_tag, constraints, constraint) {
  const c = constraints[_tag];
  return {
    ...constraints,
    [_tag]: c ? combiner.combine(c, constraint) : constraint
  };
}
const constraintsKeys = {
  string: null,
  number: null,
  bigint: null,
  array: null,
  date: null
};
function isConstraintKey(key) {
  return key in constraintsKeys;
}
/** @internal */
export function constraintContext(filters) {
  const annotations = filters.map(filter => filter.annotations?.toArbitraryConstraint).filter(Predicate.isNotUndefined);
  return ctx => {
    const constraints = annotations.reduce((acc, c) => {
      const keys = Object.keys(c);
      for (const key of keys) {
        if (isConstraintKey(key)) {
          acc = merge(key, acc, c[key]);
        }
      }
      return acc;
    }, ctx.constraints || {});
    return {
      ...ctx,
      constraints
    };
  };
}
function resetContext(ctx) {
  return {
    ...ctx,
    constraints: undefined
  };
}
/** @internal */
export function getFilters(checks) {
  if (checks) {
    return checks.flatMap(check => {
      switch (check._tag) {
        case "Filter":
          return [check];
        case "FilterGroup":
          return getFilters(check.checks);
      }
    });
  }
  return [];
}
/** @internal */
export const memoized = /*#__PURE__*/memoize(ast => {
  return recur(ast, []);
});
function recur(ast, path) {
  // ---------------------------------------------
  // handle Override annotation
  // ---------------------------------------------
  const annotation = InternalAnnotations.resolve(ast)?.toArbitrary;
  if (annotation) {
    const typeParameters = AST.isDeclaration(ast) ? ast.typeParameters.map(tp => recur(tp, path)) : [];
    const filters = getFilters(ast.checks);
    const f = constraintContext(filters);
    return (fc, ctx) => applyChecks(ast, filters, annotation(typeParameters.map(tp => tp(fc, resetContext(ctx))))(fc, f(ctx)));
  }
  if (ast.checks) {
    const filters = getFilters(ast.checks);
    const f = constraintContext(filters);
    const lawc = recur(AST.replaceChecks(ast, undefined), path);
    return (fc, ctx) => applyChecks(ast, filters, lawc(fc, f(ctx)));
  }
  return base(ast, path);
}
function base(ast, path) {
  switch (ast._tag) {
    case "Never":
    case "Declaration":
      throw errorWithPath(`Unsupported AST ${ast._tag}`, path);
    case "Null":
      return fc => fc.constant(null);
    case "Void":
    case "Undefined":
      return fc => fc.constant(undefined);
    case "Unknown":
    case "Any":
      return fc => fc.anything();
    case "String":
      return (fc, ctx) => {
        const constraint = ctx.constraints?.string;
        const patterns = constraint?.patterns;
        if (patterns) {
          return fc.oneof(...patterns.map(pattern => fc.stringMatching(new RegExp(pattern))));
        }
        return fc.string(constraint);
      };
    case "Number":
      return (fc, ctx) => {
        const constraint = ctx.constraints?.number;
        if (constraint?.isInteger) {
          return fc.integer(constraint);
        }
        return fc.float(constraint);
      };
    case "Boolean":
      return fc => fc.boolean();
    case "BigInt":
      return (fc, ctx) => fc.bigInt(ctx.constraints?.bigint ?? {});
    case "Symbol":
      return fc => fc.string().map(Symbol.for);
    case "Literal":
      return fc => fc.constant(ast.literal);
    case "UniqueSymbol":
      return fc => fc.constant(ast.symbol);
    case "ObjectKeyword":
      return fc => fc.oneof(fc.object(), fc.array(fc.anything()));
    case "Enum":
      return recur(AST.enumsToLiterals(ast), path);
    case "TemplateLiteral":
      return fc => fc.stringMatching(AST.getTemplateLiteralRegExp(ast));
    case "Arrays":
      return (fc, ctx) => {
        const reset = resetContext(ctx);
        // ---------------------------------------------
        // handle elements
        // ---------------------------------------------
        const elements = ast.elements.map((e, i) => {
          const out = recur(e, [...path, i])(fc, reset);
          if (!AST.isOptional(e)) {
            return out.map(Option.some);
          }
          return out.chain(a => fc.boolean().map(b => b ? Option.some(a) : Option.none()));
        });
        let out = fc.tuple(...elements).map(Array.getSomes);
        // ---------------------------------------------
        // handle rest element
        // ---------------------------------------------
        if (Array.isReadonlyArrayNonEmpty(ast.rest)) {
          const len = ast.elements.length;
          const [head, ...tail] = ast.rest.map((r, i) => recur(r, [...path, len + i])(fc, reset));
          const rest = array(fc, ast.elements.length === 0 ? ctx : reset, head);
          out = out.chain(as => {
            if (as.length < len) {
              return fc.constant(as);
            }
            return rest.map(rest => [...as, ...rest]);
          });
          // ---------------------------------------------
          // handle post rest elements
          // ---------------------------------------------
          if (tail.length > 0) {
            const t = fc.tuple(...tail);
            out = out.chain(as => {
              if (as.length < len) {
                return fc.constant(as);
              }
              return t.map(rest => [...as, ...rest]);
            });
          }
        }
        return out;
      };
    case "Objects":
      return (fc, ctx) => {
        const reset = resetContext(ctx);
        // ---------------------------------------------
        // handle property signatures
        // ---------------------------------------------
        const pss = {};
        const requiredKeys = [];
        for (const ps of ast.propertySignatures) {
          const name = ps.name;
          if (!AST.isOptional(ps.type)) {
            requiredKeys.push(name);
          }
          pss[name] = recur(ps.type, [...path, name])(fc, reset);
        }
        let out = fc.record(pss, {
          requiredKeys
        });
        // ---------------------------------------------
        // handle index signatures
        // ---------------------------------------------
        for (const is of ast.indexSignatures) {
          const entry = fc.tuple(recur(is.parameter, path)(fc, reset), recur(is.type, path)(fc, reset));
          const entries = array(fc, ast.propertySignatures.length === 0 ? ctx : reset, entry);
          out = out.chain(o => {
            return entries.map(entries => {
              return {
                ...Object.fromEntries(entries),
                ...o
              };
            });
          });
        }
        return out;
      };
    case "Union":
      return (fc, ctx) => fc.oneof(...ast.types.map(ast => recur(ast, path)(fc, ctx)));
    case "Suspend":
      {
        const memo = arbitraryMemoMap.get(ast);
        if (memo) return memo;
        const get = AST.memoizeThunk(() => recur(ast.thunk(), path));
        const out = (fc, ctx) => fc.constant(null).chain(() => get()(fc, {
          ...ctx,
          isSuspend: true
        }));
        arbitraryMemoMap.set(ast, out);
        return out;
      }
  }
}
//# sourceMappingURL=arbitrary.js.map