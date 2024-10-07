import { move } from "../move.ts";
import type { ParseFail, ParseOk, Parser } from "../parse.ts";
import { defaultLocation } from "../SourceLocation.ts";
import { startsWith } from "@std/bytes";

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
export const text = <S extends string>(string: S): Parser<S, Uint8Array> => {
  const encoded = new TextEncoder().encode(string);

  return (input, prev = defaultLocation) => {
    if (startsWith(input.subarray(prev.index), encoded)) {
      const next = move(input, prev, prev.index + encoded.length);
      return {
        ok: true,
        value: string,
        next,
        expected: [{ expected: new Set([string]), location: next }],
      } satisfies ParseOk<S>;
    }
    return {
      ok: false,
      expected: [{ expected: new Set([string]), location: prev }],
    } satisfies ParseFail;
  };
};
