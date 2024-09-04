import type { DeepReadonly } from "./deep_readonly.ts";
import type { Parser } from "./parser.ts";

/**
 * Returns a parser that yields the given `value` and consumes no input.
 *
 * Usually used as a fallback parser in case you want the option of parsing nothing
 * at all.
 *
 * @example
 * ```ts
 * import { choice, ok, text, tryParse } from "@takker/parser";
 *
 * const sign = choice(text("+"), text("-"), ok(""));
 * tryParse(sign, "+"); // => "+"
 * tryParse(sign, "-"); // => "-"
 * tryParse(sign, ""); // => ""
 * ```
 */
export const ok = <
  A,
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  value: DeepReadonly<A>,
): Parser<A, never, Input, Data, Cursor, T, FormattedCursor> =>
(_, data) => [true, value, data];
