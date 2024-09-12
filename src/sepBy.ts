import { chain } from "./chain.ts";
import { map } from "./map.ts";
import { next } from "./next.ts";
import { isRangeValid } from "./isRangeValid.ts";
import { ok } from "./ok.ts";
import { or } from "./or.ts";
import { repeat } from "./repeat.ts";
import type { Parser } from "./parser.ts";

export const sepBy = <A, S>(
  parser: Parser<A>,
  separator: Parser<S>,
  min = 0,
  max = Infinity,
): Parser<A[]> => {
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
