import { contextOk } from "./context.ts";
import type { Parser } from "./parse.ts";

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
export const ok = <A>(value: A): Parser<A> => (context) =>
  contextOk(context, context[1][0], value);
