import { map } from "./map.ts";
import { chain } from "./chain.ts";
import type { Parser, ParserdData, ParserdExpected } from "./parser.ts";
import { ok } from "./ok.ts";

export type JoinData<ParserList extends readonly unknown[]> = ParserList extends
  [infer P, ...infer RestParserList]
  ? ParserdData<P> extends unknown
    ? [ParserdData<P>, ...JoinData<RestParserList>]
  : never
  : [];

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
  Expected extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
  ParserList extends readonly Parser<
    unknown,
    string[],
    Input,
    Data,
    Cursor,
    T,
    FormattedCursor
  >[],
>(
  ...parsers: [
    Parser<A, Expected, Input, Data, Cursor, T, FormattedCursor>,
    ...ParserList,
  ]
): Parser<
  [A, ...JoinData<ParserList>],
  Expected | ParserdExpected<ParserList[number]>,
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor
> =>
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce(
    (acc, p) => chain(acc, (array) => map(p, (value) => [...array, value])),
    ok([] as unknown[]),
  ) as Parser<
    [A, ...JoinData<ParserList>],
    Expected | ParserdExpected<ParserList[number]>,
    Input,
    Data,
    Cursor,
    T,
    FormattedCursor
  >;
