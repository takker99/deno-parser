import { map } from "./map.ts";
import { chain } from "./chain.ts";
import type { Parser } from "./parse.ts";
import { ok } from "./ok.ts";
import type { IsExact } from "@std/testing/types";
export type { IsExact };

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
 * import { assertEquals } from "@std/assert";
 *
 * const abc = map(
 *   all(text("a"), text("b"), text("c")),
 *   ([first, second, third]) => {
 *     return { first, second, third };
 *   },
 * );
 *
 * assertEquals(tryParse(abc, "abc"), {
 *   first: "a",
 *   second: "b",
 *   third: "c",
 * });
 * ```
 */
export const all = <
  // deno-lint-ignore no-explicit-any
  const Parsers extends readonly Parser<unknown, any>[],
>(
  ...parsers: [...Parsers]
): CombineParser<Parsers> =>
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce<Parser<unknown[], ArrayLike<unknown>>>(
    (acc, p) => chain(acc, (array) => map(p, (value) => [...array, value])),
    ok([]),
  ) as CombineParser<Parsers>;

/**
 *  Check if type `T` is `any`.
 * @internal
 */
export type IsAny<T> = 0 extends (1 & T) ? true : false;

/**
 * Combines multiple {@linkcode Parser}s into a single {@linkcode Parser} that returns an array of the results.
 *
 * @example
 * ```ts
 * import { assertType, type IsExact } from "@std/testing/types";
 * import type { Parser } from "./parse.ts";
 *
 * assertType<
 *   IsExact<
 *     Parser<["a", "b"], string>,
 *     CombineParser<[Parser<"a", string>, Parser<"b", string>]>
 *   >
 * >(true);
 * assertType<
 *   IsExact<{
 *     name: "TypeCheckError";
 *     message: "All parsers must has the same `Input`";
 *   }, CombineParser<[Parser<"a", string>, Parser<"b", number[]>]>>
 * >(true);
 * ```
 */
export type CombineParser<
  // deno-lint-ignore no-explicit-any
  Parsers extends readonly Parser<unknown, any>[],
  Results extends readonly unknown[] = [],
  // deno-lint-ignore no-explicit-any
  Input extends ArrayLike<unknown> = any,
> = Parsers extends [] ? Parser<Results, Input>
  : Parsers extends [
    Parser<infer A, infer I>,
    // deno-lint-ignore no-explicit-any
    ...infer Rest extends readonly Parser<unknown, any>[],
  ] ? [IsAny<Input>] extends [true] ? CombineParser<Rest, [...Results, A], I>
    : [IsExact<Input, I>] extends [true]
      ? CombineParser<Rest, [...Results, A], I>
    : {
      name: "TypeCheckError";
      message: "All parsers must has the same `Input`";
    }
  : {
    name: "TypeCheckError";
    message: "Passed invalid parsers";
  };
