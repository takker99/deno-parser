import { or } from "./or.ts";
import type { Parser, ParserdData, ParserdExpected } from "./parser.ts";

export type JoinExpected<ParserList extends readonly unknown[]> =
  ParserList extends [infer P, ...infer RestParserList]
    ? ParserdExpected<P> extends unknown[]
      ? [...ParserdExpected<P>, ...JoinExpected<RestParserList>]
    : never
    : [];

/**
 * Parse using the parsers given, returning the first one that succeeds.
 *
 * > [!NOTE]
 * > Be careful with this function if multiple parsers overlap in what they
 * > parse. See the code snippet below for more details.
 *
 * > [!NOTE]
 * > The parsers do not all have to return the same type, but TypeScript
 * > does not always infer the correct type. You can switch to
 * > {@linkcode or} or supply a type parameter to this function to fix it.
 *
 * See also {@linkcode or}.
 *
 * @example
 * ```ts
 * import { choice, text, tryParse } from "@takker/parser";
 *
 * const parser1 = choice(text("a"), text("b"), text("c"));
 * tryParse(parser1, "a"); // => "a"
 * tryParse(parser1, "b"); // => "b"
 * tryParse(parser1, "c"); // => "c"
 * ```
 *
 * @example
 * ```ts
 * import { choice, text, tryParse } from "@takker/parser";
 *
 * const parser2 = choice(text("abc"), text("abc-123"));
 * tryParse(parser2, "abc-123");
 * // => Error
 * ```
 *
 * This fails because the first parser `abc` succeeds, but then there is still
 * the additional text `-123` afterward that is left unparsed. It is an error to
 * leave unparsed text after calling {@linkcode parse} or {@linkcode tryParse}.
 *
 * @example
 * ```ts
 * import { choice, text, tryParse } from "@takker/parser";
 *
 * const parser3 = choice(text("abc-123"), text("abc"));
 * tryParse(parser3, "abc-123");
 * // => "abc-123"
 * ```
 *
 * Since both parsers start with `abc`, we have to put the longer one first.
 */
export const choice = <
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
  A | ParserdData<ParserList[number]>,
  [...Expected, ...JoinExpected<ParserList>],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor
> => (
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce((acc, p) => or(acc, p)) as Parser<
    A | ParserdData<ParserList[number]>,
    [...Expected, ...JoinExpected<ParserList>],
    Input,
    Data,
    Cursor,
    T,
    FormattedCursor
  >
);
