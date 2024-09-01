import { contextOk, merge } from "./context.ts";
import { isRangeValid } from "./isRangeValid.ts";
import { ok } from "./ok.ts";
import { or } from "./or.ts";
import type { Parser } from "./parse.ts";
import { isFail, isOk } from "./action.ts";

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
 *
 * const identifier = match(/[a-z]+/i);
 * const expression = skip(identifier, text("()"));
 * const statement = skip(expression, text(";"));
 * const block = wrap(text("{"), repeat(statement), text("}"));
 * tryParse(block, "{apple();banana();coconut();}");
 * // => ["apple", "banana", "coconut"];
 *
 * const aaa = repeat(text("a"), 1, 3);
 * tryParse(aaa, ""); // => Error
 * tryParse(aaa, "a"); // => "a"
 * tryParse(aaa, "aa"); // => "aa"
 * tryParse(aaa, "aaa"); // => "aaa"
 * tryParse(aaa, "aaaa"); // => Error
 *
 * const xs = repeat(text("x"), 1);
 * tryParse(xs, ""); // => Error
 * tryParse(xs, "x"); // => "x"
 * tryParse(xs, "xx"); // => "xx"
 * ```
 *
 * @param parser The parser to repeat.
 * @param min The minimum number of times to repeat.
 * @param max The maximum number of times to repeat.
 */
export const repeat = <A>(
  parser: Parser<A>,
  min = 0,
  max = Infinity,
): Parser<A[]> => {
  if (!isRangeValid(min, max)) {
    throw new Error(`repeat: bad range (${min} to ${max})`);
  }
  if (min === 0) {
    return or(repeat(parser, 1, max), ok([]));
  }
  return (context) => {
    const items: A[] = [];
    let result = parser(context);
    if (isFail(result)) return result;

    while (isOk(result) && items.length < max) {
      items.push(result.value);
      if (result.location[0] === context[1][0]) {
        throw new Error(
          "infinite loop detected; don't call .repeat() with parsers that can accept zero characters",
        );
      }
      context = [context[0], result.location];
      result = merge(result, parser(context));
    }
    if (isFail(result) && items.length < min) {
      return result;
    }
    return merge(result, contextOk(context, context[1][0], items));
  };
};
