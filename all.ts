import { map } from "./map.ts";
import { chain } from "./chain.ts";
import type { Parser, ParserResult } from "./parse.ts";
import { ok } from "./ok.ts";

/** Parses all parsers in order, returning the values in the same order.
 *
 * This type technique is referenced from the following blog:
 * - https://blog.livewing.net/typescript-parser-combinator
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
export const all = <
  A,
  I extends ArrayLike<unknown>,
  Parsers extends Parser<unknown, I>[],
>(
  ...parsers: [Parser<A, I>, ...Parsers]
): Parser<[A, ...{ [K in keyof Parsers]: ParserResult<Parsers[K]> }], I> =>
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce(
    (acc, p) => chain(acc, (array) => map(p, (value) => [...array, value])),
    ok([] as unknown[]),
  ) as Parser<[A, ...{ [K in keyof Parsers]: ParserResult<Parsers[K]> }], I>;
