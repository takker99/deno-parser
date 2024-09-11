import { all } from "./all.ts";
import { map } from "./map.ts";
import { location } from "./location.ts";
import type { BaseReader, Parser } from "./types.ts";

export const node = <
  Reader extends BaseReader,
>() =>
<
  S extends string,
  A,
  const Expected extends string[],
  R extends Reader,
>(
  parser: Parser<A, Expected, R>,
  name: S,
): Parser<ParseNode<S, A, R>, Expected, R> =>
  map(
    all(location, parser, location),
    ([start, value, end]) => ({ name, value, start, end }),
  );

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
