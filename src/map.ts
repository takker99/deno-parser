import { chain } from "./chain.ts";
import { ok } from "./ok.ts";
import type { Parser } from "./parser.ts";

export const map = <
  A,
  const Expected extends string[],
  B,
>(
  parser: Parser<A, Expected>,
  fn: (value: A) => B,
): Parser<B, Expected> => chain(parser, (a) => ok(fn(a)));
