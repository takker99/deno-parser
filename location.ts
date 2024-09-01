import { type Context, contextOk, toSourceLocation } from "./context.ts";
import type { ActionResult, SourceLocation } from "./parse.ts";

/**
 * Parser that yields the current {@linkcode SourceLocation}, containing properties
 * `index`, `line` and `column`.
 * Useful when used before and after a given parser,
 * so you can know the source range for highlighting errors.
 * Used internally by {@linkcode node}.
 *
 * @example
 * ```ts
 * import { chain, location, map, match, type Parser, type SourceLocation, tryParse } from "@takker/parser";
 *
 * type Inspect = { type: "Identifier"; name: string; start: SourceLocation; end: SourceLocation };
 *
 * // TypeScript can't assume the type parameters of `Parser`, so you have to manually specify like this.
 * const identifier: Parser<Inspect> = chain(location, (start) => {
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
 * //   start: { index: 0, line: 1, column: 1 },
 * //   end: { index: 2, line: 1, column: 3 }
 * // }
 * ```
 */
export const location = <I extends ArrayLike<unknown>>(
  context: Context<I>,
): ActionResult<SourceLocation> =>
  contextOk(context, context[1][0], toSourceLocation(context[1]));
