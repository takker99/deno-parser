import { chain } from "./chain.ts";
import { map } from "./map.ts";
import { next } from "./next.ts";
import { isRangeValid } from "./isRangeValid.ts";
import { ok } from "./ok.ts";
import { or } from "./or.ts";
import { repeat } from "./repeat.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

/**
 * Returns a parser that parses `min` to `max` times,
 * separated by `separater`, yielding the results in an array.
 *
 * @example repeat any times
 * ```ts
 * import { match, sepBy } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals } from "@std/assert";
 *
 * const classNames = sepBy(match(/\S+/), match(/\s+/));
 * Deno.test("sepBy", () => {
 *   assertEquals(tryParse(classNames, ""), []);
 *   assertEquals(tryParse(classNames, "btn"), ["btn"]);
 *   assertEquals(tryParse(classNames, "btn btn-primary"), ["btn", "btn-primary"]);
 * });
 * ```
 *
 * @example repeat exact 3 times
 * ```ts
 * import { map, match, sepBy, text, wrap } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals, assertThrows } from "@std/assert";
 *
 * const num = map(match(/[0-9]+/), Number);
 * const color = map(
 *   wrap(
 *     text("rgb("),
 *     sepBy(num, text(","), 3, 3),
 *     text(")")
 *   ),
 *   ([red, green, blue]) => {
 *     return { red, green, blue };
 *   }
 * );
 * Deno.test("sepBy", () => {
 *   assertThrows(() => tryParse(color, "rgb()"));
 *   assertThrows(() => tryParse(color, "rgb(0)"));
 *   assertThrows(() => tryParse(color, "rgb(0,127)"));
 *   assertEquals(tryParse(color, "rgb(0,127,36)"), { red: 0, green: 127, blue: 36 });
 *   assertThrows(() => tryParse(color, "rgb(0,127,36,255)"));
 * });
 * ```
 *
 * @example repeat 2 to 3 times
 * ```ts
 * import { map, match, sepBy, text, wrap } from "@takker/parser";
 * import { tryParse } from "@takker/parser/text-parser";
 * import { assertEquals, assertThrows } from "@std/assert";
 *
 * const dimensions = sepBy(map(match(/\d+/), Number), match(/\s*x\s{0,}/), 2, 3);
 * Deno.test("sepBy", () => {
 *   assertThrows(() => tryParse(dimensions, ""));
 *   assertEquals(tryParse(dimensions, "3 x 4"), [3, 4]);
 *   assertEquals(tryParse(dimensions, "10x20x30"), [10, 20, 30]);
 *   assertThrows(() => tryParse(dimensions, "1x2x3x4"));
 * });
 * ```
 */
export const sepBy = <A, S, const Reader extends BaseReader>(
  parser: Parser<A, Reader>,
  separator: Parser<S, Reader>,
  min = 0,
  max = Infinity,
): Parser<A[], Reader> => {
  if (!isRangeValid(min, max)) {
    throw new Error(`sepBy: bad range (${min} to ${max})`);
  }
  if (min === 0) {
    return or(sepBy(parser, separator, 1, max), ok([]));
  }
  // We also know that min=1 due to previous checks, so we can skip the call
  // to `repeat` here
  if (max === 1) {
    return map(parser, (x) => [x] as const);
  }
  return chain(
    parser,
    (first) =>
      map(
        repeat(next(separator, parser), min - 1, max - 1),
        (rest) => [first, ...rest] as const,
      ),
  );
};
