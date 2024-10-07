import { makeExpected } from "./expected.ts";
import { move } from "./move.ts";
import type { Parser } from "./parse.ts";
import { defaultLocation } from "./SourceLocation.ts";

/**
 * Returns a parser that matches the entire `regexp` at the current parser
 * position.
 *
 * The following regexp flags are supported (any other regexp flag will throw an
 * error):
 *
 * - `i`
 *   ([ignoreCase](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp/ignoreCase))
 * - `s`
 *   ([dotAll](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp/dotAll))
 * - `m`
 *   ([multiline](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp/multiline))
 * - `u`
 *   ([unicode](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicode))
 *
 * > [!NOTE]
 * > Do not use the `^` anchor at the beginning of your regular expression.
 * > This internally uses [sticky](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky) (`/.../y`) regular expressions with [lastIndex](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex) set
 * > to the current parsing index.
 *
 * > [!NOTE]
 * > Capture groups `()` are not significant to this parser. The entire
 * > match is returned regardless of any capture groups used.
 *
 * @example
 * ```ts
 * import { match, tryParse } from "@takker/parser";
 * import { assertEquals } from "@std/assert";
 *
 * const identifier = match(/[a-z_]+/i);
 * assertEquals(tryParse(identifier, "internal_toString"), "internal_toString");
 *
 * const number = match(/[0-9]+/);
 * assertEquals(tryParse(number, "404"), "404");
 * ```
 */
export const match = (regexp: RegExp): Parser<string, string> => {
  for (const flag of regexp.flags) {
    switch (flag) {
      case "i": // ignoreCase
      case "s": // dotAll
      case "m": // multiline
      case "u": // unicode
        continue;
      default:
        throw new Error("only the regexp flags 'imsu' are supported");
    }
  }
  const sticky = new RegExp(regexp.source, regexp.flags + "y");
  return (input, prev = defaultLocation) => {
    const start = prev.index;
    sticky.lastIndex = start;
    const match = input.match(sticky);
    if (match) {
      const end = start + match[0].length;
      const string = input.slice(start, end);
      const next = move(input, prev, end);
      return {
        ok: true,
        value: string,
        next,
        expected: [makeExpected(prev, `${regexp}`)],
      };
    }
    return { ok: false, expected: [makeExpected(prev, `${regexp}`)] };
  };
};
