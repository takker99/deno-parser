import { isOk, type Parser } from "./parser.ts";
import { makeExpected } from "./expected.ts";
import type { BaseReader, Context, ReaderTuple } from "./reader.ts";

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
 * import { desc, map, match } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals, assertThrows } from "@std/assert";
 *
 * const jsonNumber1 = map(
 *   match(/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/),
 *   Number
 * );
 * const jsonNumber2 = desc(jsonNumber1, ["number"]);
 *
 * Deno.test("desc", () => {
 *   assertEquals(tryParse(jsonNumber1, "1312"), 1312);
 *   assertEquals(tryParse(jsonNumber1, "777"), 777);
 *   assertThrows(() => tryParse(jsonNumber1, "x"), "number");
 * });
 * ```
 */
export const desc = <
  A,
  const Reader extends BaseReader,
>(
  parser: Parser<A, Reader>,
  expected: string[],
): Parser<A, Reader> =>
<R extends Reader>(reader: ReaderTuple<R>, ...context: Context<R>) => {
  const result = parser(reader, ...context);
  if (isOk(result)) return result;
  return [
    false,
    result[1],
    [makeExpected(reader, result[1], ...expected)],
  ];
};
