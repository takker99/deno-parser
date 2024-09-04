import { all } from "./all.ts";
import type { DeepReadonly } from "./deep_readonly.ts";
import { location } from "./location.ts";
import { map } from "./map.ts";
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
 * @example Basic Usage
 * ```ts
 * import { node, match, tryParse } from "@takker/parser";
 *
 * const identifier = node(match(/[a-z]+/i), "Identifier");
 * tryParse(identifier, "hello");
 * // => {
 * //   name: "Identifier",
 * //   value: "hello",
 * //   start: SourceLocation { index: 0, line: 1, column: 1 },
 * //   end: SourceLocation { index: 5, line: 1, column: 6 } }
 * // }
 * ```
 *
 * @example Create type aliases for TypeScript use
 * ```ts
 * import type { ParseNode } from "@takker/parser";
 *
 * type LispSymbol = ParseNode<"LispSymbol", string>;
 * type LispNumber = ParseNode<"LispNumber", number>;
 * type LispList = ParseNode<"LispList", LispExpr[]>;
 * type LispExpr = LispSymbol | LispNumber | LispList;
 * ```
 */
export const node = <
  S extends string,
  A,
  const Expected extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parser: Parser<A, Expected, Input, Data, Cursor, T, FormattedCursor>,
  name: S,
): Parser<
  ParseNode<S, A, FormattedCursor>,
  Expected,
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor
> =>
  map(
    all(location, parser, location),
    ([start, value, end]) =>
      ({ name, value, start, end }) as DeepReadonly<
        ParseNode<S, A, FormattedCursor>
      >,
  );

/**
 * Result type from {@linkcode node}.
 * See {@linkcode node} for more details.
 */
export interface ParseNode<S extends string, A, FormattedCursor> {
  /**
   * The name of the node.
   * This is useful for debugging and error reporting.
   */
  name: S;

  /** The parsed value.  */
  value: A;

  /** The start location of the parsed range. */
  start: FormattedCursor;

  /** The end location of the parsed range. */
  end: FormattedCursor;
}
