import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./parser.ts";

export const next = <
  A,
  const ExpectedA extends string[],
  B,
  const ExpectedB extends string[],
>(
  parserA: Parser<A, ExpectedA>,
  parserB: Parser<B, ExpectedB>,
): Parser<B, ExpectedA | ExpectedB> => map(and(parserA, parserB), ([, b]) => b);
