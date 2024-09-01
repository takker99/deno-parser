import { ok } from "./ok.ts";
import { map } from "./map.ts";
import { chain } from "./chain.ts";
import type { Parser } from "./parse.ts";

/** A tuple of parsers */
// deno-lint-ignore no-explicit-any
type ManyParsers<A extends any[]> = {
  [P in keyof A]: Parser<A[P]>;
};
/** Parses all parsers in order, returning the values in the same order.
 *
 * > [!NOTE]
 * > The parsers do not all have to return the same type.
 *
 * See also {@linkcode and}
 *
 * @example
 * ```ts
 * import { all, map, text, tryParse } from "@takker/parser";
 *
 * const abc = map(
 *   all(text("a"), text("b"), text("c")),
 *   ([first, second, third]) => {
 *     return { first, second, third };
 *   },
 * );
 *
 * tryParse(abc, "abc");
 * // => {
 * //   first: "a",
 * //   second: "b",
 * //   third: "c",
 * // }
 * ```
 */
// deno-lint-ignore no-explicit-any
export const all = <A extends any[]>(...parsers: ManyParsers<A>): Parser<A> =>
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce(
    (acc, p) => chain(acc, (array) => map(p, (value) => [...array, value])),
    ok([]),
  );
