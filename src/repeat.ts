import { isRangeValid } from "./isRangeValid.ts";
import { isOk, nextData, parsedValue, type Parser } from "./parser.ts";
import type { DeepReadonly } from "./deep_readonly.ts";
import { discard, getNextCursor, isFinish, restore, save } from "./reader.ts";

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
export const repeat = <
  A,
  Expected extends string[],
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parser: Parser<A, Expected, Input, Data, Cursor, T, FormattedCursor>,
  min = 0,
  max = Infinity,
): Parser<A[], Expected, Input, Data, Cursor, T, FormattedCursor> => {
  if (!isRangeValid(min, max)) {
    throw new Error(`repeat: bad range (${min} to ${max})`);
  }
  return (reader, start) => {
    const items: DeepReadonly<A>[] = [];
    let prev = start;
    let next = start;
    while (true) {
      if (items.length >= max) break;

      const result = parser(reader, save(reader, next));
      prev = next;
      const is = isOk(result);
      const isLack = items.length < min;
      next = (is || isLack ? discard : restore)(reader, nextData(result));
      if (!is) {
        if (isLack) return result;
        break;
      }
      if (
        getNextCursor(reader, prev) === getNextCursor(reader, next) &&
        max == Infinity && !isFinish(reader, next)
      ) {
        throw new Error(
          "infinite loop detected; don't call .repeat() with parsers that can accept zero characters",
        );
      }
      items.push(parsedValue(result));
    }
    return [true, items, next];
  };
};
