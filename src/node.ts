import { all } from "./all.ts";
import { map } from "./map.ts";
import { location } from "./location.ts";
import type { BaseReader } from "./reader.ts";
import type { Parser } from "./parser.ts";

/**
 * Returns a parser that adds `name` and start/end location metadata.
 *
 * This should be used heavily within your parser so that you can do proper error
 * reporting. You may also wish to keep this information available in the runtime
 * of your language for things like stack traces.
 *
 * This is just a convenience method built around `location`. Don't hesitate to
 * avoid this function and instead use your own custom node creation
 * function that fits your domain better.
 *
 * Location `index` is 0-indexed and `line`/`column` information is 1-indexed.
 *
 * > [!NOTE]
 * > The `end` location is _exclusive_ of the parse (one character further)
 *
 * @example
 * ```ts
 * import { node, match, type ParseNode } from "@takker/parser";
 * import { type TextReader, tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * type LispSymbol = ParseNode<"LispSymbol", string, TextReader>;
 * type LispNumber = ParseNode<"LispNumber", number, TextReader>;
 * type LispList = ParseNode<"LispList", LispExpr[], TextReader>;
 * type LispExpr = LispSymbol | LispNumber | LispList;
 *
 * const identifier = node<TextReader>()(match(/[a-z]+/i), "Identifier");
 * Deno.test("node", () => {
 *   assertEquals(tryParse(identifier, "hello"), {
 *     name: "Identifier",
 *     value: "hello",
 *     start: { index: 0, line: 1, column: 1 },
 *     end: { index: 5, line: 1, column: 6 },
 *   });
 * });
 * ```
 */
export const node = <
  Reader extends BaseReader,
>(): <S extends string, A, R extends Reader>(
  parser: Parser<A, R>,
  name: S,
) => Parser<ParseNode<S, A, R>, R> => {
  const loc = location<Reader>();
  return (parser, name) =>
    map(
      all(loc, parser, loc),
      ([start, value, end]) => ({ name, value, start, end }),
    );
};

/**
 * Result type from {@linkcode node}.
 * See {@linkcode node} for more details.
 */
export interface ParseNode<S extends string, A, R extends BaseReader> {
  /**
   * The name of the node.
   * This is useful for debugging and error reporting.
   */
  name: S;

  /** The parsed value.  */
  value: A;

  /** The start location of the parsed range. */
  start: R["location"];

  /** The end location of the parsed range. */
  end: R["location"];
}
