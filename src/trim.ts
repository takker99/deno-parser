import type { Parser } from "./parser.ts";
import { wrap } from "./wrap.ts";

export const trim = <
  A,
  const ExpectedA extends string[],
  B,
  const ExpectedB extends string[],
>(
  parser: Parser<A, ExpectedA>,
  beforeAndAfter: Parser<B, ExpectedB>,
): Parser<A, ExpectedA | ExpectedB> =>
  wrap(beforeAndAfter, parser, beforeAndAfter);
