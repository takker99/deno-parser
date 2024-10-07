import type { TextReader } from "./text_parser.ts";
import { read } from "./reader.ts";
import type { Parser } from "./parser.ts";
import { makeExpected } from "./expected.ts";

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
 * import { match } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * Deno.test("match", () => {
 *   const identifier = match(/[a-z_]+/i);
 *   assertEquals(tryParse(identifier, "internal_toString"), "internal_toString");
 *   const number = match(/[0-9]+/);
 *   assertEquals(tryParse(number, "404"), "404");
 * });
 * ```
 */
export const match = (regexp: RegExp): Parser<string, TextReader> => {
  for (const flag of regexp.flags) {
    if (
      [
        "i", // ignoreCase
        "s", // dotAll
        "m", // multiline
        "u", // unicode
      ].includes(flag)
    ) continue;
    throw new Error("only the regexp flags 'imsu' are supported");
  }
  const sticky = new RegExp(regexp.source, regexp.flags + "y");
  return (reader, ...context) => {
    sticky.lastIndex = context[1]?.[0]?.[0] ?? 0;
    const match = context[0].match(sticky);
    if (!match) {
      return [false, context, [makeExpected(reader, context, `${regexp}`)]];
    }
    const res = read(match[0].length, reader, ...context);
    return [true, res[1], [], res[2] ?? ""];
  };
};
