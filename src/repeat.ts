import { isRangeValid } from "./isRangeValid.ts";
import { move } from "./move.ts";
import { ok } from "./ok.ts";
import { or } from "./or.ts";
import { isFail, isOk, type Parser } from "./parse.ts";
import { defaultLocation } from "./SourceLocation.ts";
import { merge } from "./merge.ts";

/**
 * Repeats the current parser between min and max times, yielding the results
 * in an array.
 *
 * Repeats the current parser `min` to `max` times, yielding the results in an array.
 *
 * Given that this can match **zero** times, take care not to parse this
 * accidentally. Usually this parser should come up in the context of some other
 * characters that must be present, such as `{}` to indicate a code block, with
 * zero or more statements inside.
 *
 * ```ts
 * import { match, repeat, skip, text, tryParse, wrap } from "@takker/parser";
 * import { assertEquals, assertThrows } from "@std/assert";
 *
 * const identifier = match(/[a-z]+/i);
 * const expression = skip(identifier, text("()"));
 * const statement = skip(expression, text(";"));
 * const block = wrap(text("{"), repeat(statement), text("}"));
 * assertEquals(tryParse(block, "{apple();banana();coconut();}"), ["apple", "banana", "coconut"]);
 *
 * const aaa = repeat(text("a"), 1, 3);
 * assertThrows(() => tryParse(aaa, ""));
 * assertEquals(tryParse(aaa, "a"), ["a"]);
 * assertEquals(tryParse(aaa, "aa"), ["a", "a"]);
 * assertEquals(tryParse(aaa, "aaa"), ["a", "a", "a"]);
 * assertThrows(() => tryParse(aaa, "aaaa"));
 *
 * const xs = repeat(text("x"), 1);
 * assertThrows(() => tryParse(xs, ""));
 * assertEquals(tryParse(xs, "x"), ["x"]);
 * assertEquals(tryParse(xs, "xx"), ["x", "x"]);
 * ```
 *
 * @param parser The parser to repeat.
 * @param min The minimum number of times to repeat.
 * @param max The maximum number of times to repeat.
 */
export const repeat = <A, I extends ArrayLike<unknown>>(
  parser: Parser<A, I>,
  min = 0,
  max = Infinity,
): Parser<A[], I> => {
  if (!isRangeValid(min, max)) {
    throw new Error(`repeat: bad range (${min} to ${max})`);
  }
  if (min === 0) {
    return or(repeat(parser, 1, max), ok([]));
  }
  return (input, prev = defaultLocation, options) => {
    const items: A[] = [];
    let result = parser(input, prev, options);
    if (isFail(result)) return result;

    let location = prev;
    while (isOk(result) && items.length < max) {
      items.push(result.value);
      if (result.next.index === location.index) {
        throw new Error(
          "infinite loop detected; don't call .repeat() with parsers that can accept zero characters",
        );
      }
      location = move(input, location, result.next.index);
      result = merge(result, parser(input, location, options));
    }
    if (isFail(result) && items.length < min) {
      return result;
    }
    return merge(result, {
      ok: true,
      value: items,
      next: location,
      expected: [],
    });
  };
};
