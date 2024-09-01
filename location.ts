import { contextOk, toSourceLocation } from "./context.ts";
import type { Parser, SourceLocation } from "./parse.ts";

/**
 * Parser that yields the current {@linkcode SourceLocation}, containing properties
 * `index`, `line` and `column`.
 * Useful when used before and after a given parser,
 * so you can know the source range for highlighting errors.
 * Used internally by {@linkcode node}.
 *
 * @example
 * ```ts
 * import { chain, location, map, match, tryParse } from "@takker/parser";
 *
 * const identifier = chain(location, (start) => {
 *   return chain(match(/[a-z]+/i), (name) => {
 *     return map(location, (end) => {
 *       return { type: "Identifier", name, start, end };
 *     });
 *   });
 * });
 * tryParse(identifier, "abc");
 * // => {
 * //   type: "Identifier",
 * //   name: "abc",
 * //   start: SourceLocation { index: 0, line: 1, column: 1 },
 * //   end: SourceLocation { index: 2, line: 1, column: 3 }
 * // }
 * ```
 */
export const location: Parser<SourceLocation> = (context) =>
  contextOk(context, context[1][0], toSourceLocation(context[1]));
