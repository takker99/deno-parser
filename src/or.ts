import type { Parser } from "./parser.ts";
import { discard, restore, save } from "./reader.ts";

/**
 * Try to parse using `parserA`. If that fails, parse using `parserB`.
 *
 * This is good for parsing things like _expressions_ or _statements_ in
 * programming languages, where many different types of things are applicable.
 *
 * See {@linkcode choice} for additional information.
 *
 * @example Basic usage
 * ```ts
 * import { or, text, tryParse } from "@takker/parser";
 *
 * const a = text("a");
 * const b = text("b");
 * const ab = or(a, b);
 * tryParse(ab, "a"); // => "a"
 * tryParse(ab, "b"); // => "b"
 * ```
 *
 * @example Optional parsers
 * ```ts
 * import { ok, or, text, tryParse } from "@takker/parser";
 *
 * // You can also use this to implement optional parsers
 * const aMaybe = or(text("a"), ok(null));
 * tryParse(aMaybe, "a"); // => "a"
 * tryParse(aMaybe, ""); // => null
 * ```
 */
export const or = <
  A,
  const ExpectedA extends string[],
  B,
  const ExpectedB extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parserA: Parser<A, ExpectedA, Input, Data, Cursor, T, FormattedCursor>,
  parserB: Parser<B, ExpectedB, Input, Data, Cursor, T, FormattedCursor>,
): Parser<
  A | B,
  [...ExpectedA, ...ExpectedB],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor
> =>
(reader, data) => {
  const a = parserA(reader, save(reader, data));
  if (a[0]) return [a[0], a[1], discard(reader, a[2])];

  const b = parserB(reader, restore(reader, a[2]));
  if (!b[0]) {
    const [x, y, z, expected] = b;
    return [x, y, z, [...a[3], ...expected]];
  }
  return b;
};
