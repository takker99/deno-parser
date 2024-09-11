import { next } from "./next.ts";
import { skip } from "./skip.ts";
import type { Parser } from "./parser.ts";

export const wrap = <
  L,
  const ExpectedL extends string[],
  A,
  const ExpectedA extends string[],
  R,
  const ExpectedR extends string[],
>(
  parserL: Parser<L, ExpectedL>,
  parserA: Parser<A, ExpectedA>,
  parserR: Parser<R, ExpectedR>,
): Parser<A, ExpectedL | ExpectedA | ExpectedR> =>
  next(parserL, skip(parserA, parserR));
