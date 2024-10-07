import { makeExpected } from "./expected.ts";
import type { Parser } from "./parse.ts";
import { defaultLocation } from "./SourceLocation.ts";

/**
 * Returns a parser which parses the same value, but discards other error messages,
 * using the supplied `expected` messages instead.
 *
 * This function should only be used on tokens within your grammar. That means
 * things like strings or numbers usually. You do not want to use it large things
 * like class definitions. You should generally use this after any parser that uses
 * a regular expression, otherwise your parse failure message will just be the
 * regular expression source code.
 *
 * @example
 * ```ts
 * import { desc, map, match, tryParse } from "@takker/parser";
 * import { assertThrows } from "@std/assert";
 *
 * const jsonNumber1 = map(
 *   match(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/),
 *   Number
 * );
 * const jsonNumber2 = desc(jsonNumber1, ["number"]);
 *
 * assertThrows(() => tryParse(jsonNumber1, "x"), "expected /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/");
 * assertThrows(() => tryParse(jsonNumber2, "x"), "expected number");
 * ```
 */
export const desc = <A, I extends ArrayLike<unknown>>(
  parser: Parser<A, I>,
  expected: string[],
): Parser<A, I> =>
(input, prev = defaultLocation, options) => {
  const result = parser(input, prev, options);
  result.expected = [makeExpected(prev, ...expected)];
  return result;
};
