import { chain } from "./chain.ts";
import { map } from "./map.ts";
import { ok } from "./ok.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Join {@linkcode Parser}s into a single parser.
 *
 * @template ParserList A list of parsers to join.
 * @template ValueList A internal variable to store the values of the parsers. This should not be used directly.
 *
 * @example
 * ```ts
 * import { assertType, type IsExact } from "@std/testing/types";
 * import type { JoinParsers, Parser } from "@takker/parser";
 *
 * Deno.test("JoinParsers", () => {
 *   assertType<
 *     IsExact<
 *       JoinParsers<
 *         [
 *           Parser<string>,
 *           Parser<number>,
 *           Parser<"test">,
 *           Parser<["a", "b", "c", Set<number>]>,
 *         ]
 *       >,
 *       Parser<[string, number, "test", ["a", "b", "c", Set<number>]]>
 *     >
 *   >(true);
 *   assertType<IsExact<JoinParsers<[]>, Parser<[]>>>(true);
 * });
 * ```
 */
export type JoinParsers<
  ParserList extends readonly Parser<unknown>[],
  ValueList extends readonly unknown[] = [],
  Reader extends BaseReader = BaseReader,
> = ParserList extends [
  infer P extends Parser<unknown>,
  ...infer RestParserList extends readonly Parser<unknown>[],
]
  ? P extends Parser<infer A, infer R extends BaseReader>
    ? JoinParsers<RestParserList, [...ValueList, A], Reader | R>
  : never
  : Parser<ValueList, Reader>;

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
 * import { all, map, text } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const abc = map(
 *   all(text("a"), text("b"), text("c")),
 *   ([first, second, third]) => {
 *     return { first, second, third };
 *   },
 * );
 *
 * Deno.test("all", () => {
 *   assertEquals(tryParse(abc, "abc"), {
 *     first: "a",
 *     second: "b",
 *     third: "c",
 *   });
 * });
 * ```
 */
export const all = <
  const Reader extends BaseReader,
  ParserList extends readonly Parser<unknown, Reader>[],
>(
  ...parsers: [...ParserList]
): JoinParsers<ParserList> =>
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce(
    (acc, p) => chain(acc, (array) => map(p, (value) => [...array, value])),
    ok([] as unknown[]),
  ) as JoinParsers<ParserList>;
