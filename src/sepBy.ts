import { chain } from "./chain.ts";
import { map } from "./map.ts";
import { next } from "./next.ts";
import { isRangeValid } from "./isRangeValid.ts";
import { ok } from "./ok.ts";
import { or } from "./or.ts";
import type { Parser } from "./parse.ts";
import { repeat } from "./repeat.ts";

/**
 * Returns a parser that parses `min` to `max` times,
 * separated by `separater`, yielding the results in an array.
 *
 * @example
 * ```ts
 * import { map, match, sepBy, text, tryParse, wrap } from "@takker/parser";
 * import { assertEquals, assertThrows } from "@std/assert";
 *
 * const num = map(match(/[0-9]+/), Number);
 * const color = map(
 *   wrap(
 *     text("rgb("),
 *     sepBy(num, text(","), 1),
 *     text(")")
 *   ),
 *   ([red, green, blue]) => {
 *     return { red, green, blue };
 *   }
 * );
 * assertEquals(tryParse(color, "rgb(0,127,36)"), { red: 0, green: 127, blue: 36 });
 *
 * const classNames = sepBy(match(/\S+/), match(/\s+/));
 * assertEquals(tryParse(classNames, ""), []);
 * assertEquals(tryParse(classNames, "btn"), ["btn"]);
 * assertEquals(tryParse(classNames, "btn btn-primary"), ["btn", "btn-primary"]);
 *
 * const dimensions = sepBy(
 *   map(match(/\d+/), Number),
 *   match(/\s*x\s{0,}/), 2, 3,
 * );
 * assertThrows(() => tryParse(dimensions, ""));
 * assertEquals(tryParse(dimensions, "3 x 4"), [3, 4]);
 * assertEquals(tryParse(dimensions, "10x20x30"), [10, 20, 30]);
 * assertThrows(() => tryParse(dimensions, "1x2x3x4"));
 * ```
 */
export const sepBy = <A, B, I extends ArrayLike<unknown>>(
  parser: Parser<A, I>,
  separator: Parser<B, I>,
  min = 0,
  max = Infinity,
): Parser<A[], I> => {
  if (!isRangeValid(min, max)) {
    throw new Error(`sepBy: bad range (${min} to ${max})`);
  }
  if (min === 0) {
    return or(sepBy(parser, separator, 1, max), ok([]));
  }
  // We also know that min=1 due to previous checks, so we can skip the call
  // to `repeat` here
  if (max === 1) {
    return map(parser, (x) => [x]);
  }
  return chain(
    parser,
    (first) =>
      map(
        repeat(next(separator, parser), min - 1, max - 1),
        (rest) => [first, ...rest],
      ),
  );
};
