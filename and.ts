import { contextOk, merge } from "./context.ts";
import type { Parser } from "./parse.ts";
import { isFail, isOk } from "./action.ts";

/**
 * Combines two parsers one after the other, yielding the results of both in
 * an array.
 *
 * @example
 * ```ts
 * import { and, text, tryParse } from "./mod.ts";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = and(a, b);
 * tryParse(ab, "a");
 * // => ["a", "b"]
```
 */
export const and =
  <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<[A, B]> =>
  (
    context,
  ) => {
    const a = parserA(context);
    if (isFail(a)) return a;
    context = [context[0], a.location];
    const b = merge(a, parserB(context));
    if (isOk(b)) {
      const value: [A, B] = [a.value, b.value];
      return merge(b, contextOk(context, b.location[0], value));
    }
    return b;
  };
