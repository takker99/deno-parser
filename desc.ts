import type { Parser } from "./parse.ts";
import { isOk, makeActionFail } from "./action.ts";

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
 *
 * const jsonNumber1 = map(
 *   match(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/),
 *   Number
 * );
 * const jsonNumber2 = desc(jsonNumber1, ["number"]);
 *
 * tryParse(jsonNumber1, "x");
 * // => ["/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/"]
 *
 * tryParse(jsonNumber2, "x");
 * // => ["number"]
 * ```
 */
export const desc =
  <A>(parser: Parser<A>, expected: string[]): Parser<A> => (context) => {
    const result = parser(context);
    return isOk(result) ? result : makeActionFail(result.furthest, expected);
  };
