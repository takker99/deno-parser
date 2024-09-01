import { contextFail, contextOk } from "./context.ts";
import type { Parser } from "./parse.ts";

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
 * const identifier = match(/[a-z_]+/i);
 * tryParse(identifier, "internal_toString");
 * // => "internal_toString"
 *
 * const number = match(/[0-9]+/);
 * tryParse(number, "404");
 * // => 404
 * ```
 */
export const match = (regexp: RegExp): Parser<string> => {
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
  return (context) => {
    const [input, [start]] = context;
    sticky.lastIndex = start;
    const match = input.match(sticky);
    if (match) {
      const end = start + match[0].length;
      const string = input.slice(start, end);
      return contextOk(context, end, string);
    }
    return contextFail(context, start, [`${regexp}`]);
  };
};
