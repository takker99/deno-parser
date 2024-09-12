import { isRangeValid } from "./isRangeValid.ts";
import {
  type BaseReader,
  compare,
  type Context,
  drop,
  getCurrentPosition,
  isDone,
  pop,
  type ReaderTuple,
  save,
} from "./reader.ts";
import { isOk, type Parser } from "./parser.ts";

/**
 * Repeats `parser` between `min` and `max` times, yielding the results in an array.
 *
 * Given that this can match **zero** times, take care not to parse this
 * accidentally. Usually this parser should come up in the context of some other
 * characters that must be present, such as `{}` to indicate a code block, with
 * zero or more statements inside.
 *
 * @example repeat any times (default)
 * ```ts
 * import { match, repeat, skip, text, wrap } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const identifier = match(/[a-z]+/i);
 * const statement = skip(identifier, text("();"));
 * const block = wrap(text("{"), repeat(statement), text("}"));
 * Deno.test("repeat", () => {
 *   assertEquals(tryParse(block, "{}"), []);
 *   assertEquals(tryParse(block, "{apple();}"), ["apple"]);
 *   assertEquals(tryParse(block, "{apple();banana();}"), ["apple", "banana"]);
 *   assertEquals(tryParse(block, "{apple();banana();coconut();}"), ["apple", "banana", "coconut"]);
 * });
 * ```
 *
 * @example repeat between 1 and 3 times
 * ```ts
 * import { match, repeat, skip, text, wrap } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals, assertThrows } from "@std/assert";
 *
 * const aaa = repeat(text("a"), 1, 3);
 * Deno.test("repeat", () => {
 *   assertThrows(() => tryParse(aaa, ""));
 *   assertEquals(tryParse(aaa, "a"), ["a"]);
 *   assertEquals(tryParse(aaa, "aa"), ["a", "a"]);
 *   assertEquals(tryParse(aaa, "aaa"), ["a", "a", "a"]);
 *   assertThrows(() => tryParse(aaa, "aaaa"));
 * });
 * ```
 *
 * @example repeat at least once
 * ```ts
 * import { match, repeat, skip, text, wrap } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals, assertThrows } from "@std/assert";
 *
 * const xs = repeat(text("x"), 1);
 * Deno.test("repeat", () => {
 *   assertThrows(() => tryParse(xs, ""));
 *   assertEquals(tryParse(xs, "x"), ["x"]);
 *   assertEquals(tryParse(xs, "xx"), ["x", "x"]);
 * });
 * ```
 *
 * @param parser The parser to repeat.
 * @param min The minimum number of times to repeat.
 * @param max The maximum number of times to repeat.
 */
export const repeat = <
  A,
  const Reader extends BaseReader,
>(parser: Parser<A, Reader>, min = 0, max = Infinity): Parser<A[], Reader> => {
  if (!isRangeValid(min, max)) {
    throw new Error(`repeat: bad range (${min} to ${max})`);
  }
  return <R extends Reader>(
    reader: ReaderTuple<R>,
    ...start: Context<R>
  ) => {
    const items: A[] = [];
    let prev = start;
    let next = start;
    while (true) {
      if (items.length >= max) break;

      const result = parser(reader, ...save(reader, next));
      prev = next;
      const ok = isOk(result);
      const isLack = items.length < min;
      next = (!ok && !isLack ? pop : drop)(reader, result[1]);
      if (!ok) {
        if (!isLack) return [true, next, result[2], items];
        return result;
      }
      if (
        compare(
            reader,
            getCurrentPosition(reader, prev),
            getCurrentPosition(reader, next),
          ) ==
          0 &&
        max == Infinity && !isDone(reader, next)
      ) {
        throw new Error(
          "infinite loop detected; don't call .repeat() with parsers that can accept zero characters",
        );
      }
      items.push(result[3]);
    }
    return [true, next, [], items];
  };
};
