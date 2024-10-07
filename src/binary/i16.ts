import { move } from "../move.ts";
import type { ParseFail, ParseOk, Parser } from "../parse.ts";
import { defaultLocation } from "../SourceLocation.ts";
import { getUint16BE } from "@takker/bytes";

/** Returns a parser that matches the exact `string` supplied.
 *
 * This is typically used for things like parsing keywords (`for`, `while`, `if`,
 * `else`, `let`...), or parsing static characters such as `{`, `}`, `"`, `'`...
 *
 * @example
 * ```ts
 * import { and, tryParse } from "@takker/parser";
 * import { text } from "./text.ts";
 * import { assertEquals } from "@std/assert";
 *
 * const keywordWhile = text("while");
 * const paren = and(text("("), text(")"));
 * assertEquals(tryParse(keywordWhile, new Uint8Array([ 119, 104, 105, 108, 101 ])), "while");
 * assertEquals(tryParse(paren, new Uint8Array( [ 40, 41 ])), ["(", ")"]);
 * ```
 */
export const i16 =
  <N extends number>(value: N): Parser<N, Uint8Array> =>
  (input, prev = defaultLocation) => {
    if (
      input.length > prev.index + 1 && getUint16BE(input, prev.index) === value
    ) {
      const next = move(input, prev, prev.index + 2);
      return {
        ok: true,
        value,
        next,
        expected: [{ expected: new Set([`${value}`]), location: next }],
      } satisfies ParseOk<N>;
    }
    return {
      ok: false,
      expected: [{ expected: new Set([`${value}`]), location: prev }],
    } satisfies ParseFail;
  };
