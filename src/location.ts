import type { Parser } from "./parser.ts";
import {
  type BaseReader,
  formatLocation,
  getCurrentPosition,
} from "./reader.ts";

/**
 * Parser that yields the current {@linkcode BaseReader["location"]}, containing properties
 * `index`, `line` and `column`.
 * Useful when used before and after a given parser,
 * so you can know the source range for highlighting errors.
 * Used internally by {@linkcode node}.
 *
 * @example
 * ```ts
 * import { chain, location, map, match } from "@takker/parser";
 * import { type TextReader, tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const identifier = chain(
 *   location<TextReader>(),
 *   (start) =>
 *     chain(
 *       match(/[a-z]+/i),
 *       (name) =>
 *         map(
 *           location<TextReader>(),
 *           (end) => ({ type: "Identifier", name, start, end }),
 *         ),
 *     ),
 * );
 * Deno.test("location", () => {
 *   assertEquals(tryParse(identifier, "abc"), {
 *     type: "Identifier",
 *     name: "abc",
 *     start: { index: 0, line: 1, column: 1 },
 *     end: { index: 3, line: 1, column: 4 },
 *   });
 * });
 * ```
 */
export const location =
  <Reader extends BaseReader>(): Parser<Reader["location"], Reader> =>
  (reader, input, seeker) => [
    true,
    [input, seeker],
    [],
    formatLocation(reader, getCurrentPosition(reader, [input, seeker])),
  ];
