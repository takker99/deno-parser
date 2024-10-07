import { move } from "./move.ts";
import type { ParseFail, ParseOk, Parser } from "./parse.ts";
import { defaultLocation } from "./SourceLocation.ts";

/** Returns a parser that matches the exact `string` supplied.
 *
 * This is typically used for things like parsing keywords (`for`, `while`, `if`,
 * `else`, `let`...), or parsing static characters such as `{`, `}`, `"`, `'`...
 *
 * @example
 * ```ts
 * import { and, text, tryParse } from "@takker/parser";
 * import { assertEquals } from "@std/assert";
 *
 * const keywordWhile = text("while");
 * const paren = and(text("("), text(")"));
 * assertEquals(tryParse(keywordWhile, "while"), "while");
 * assertEquals(tryParse(paren, "()"), ["(", ")"]);
 * ```
 */
export const text =
  <S extends string>(string: S): Parser<S, string> =>
  (input, prev = defaultLocation) => {
    const start = prev.index;
    const end = start + string.length;
    if (input.slice(start, end) == string) {
      const next = move(input, prev, end);
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
