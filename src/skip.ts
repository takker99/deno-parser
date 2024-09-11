import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./types.ts";

export const skip = <
  A,
  const ExpectedA extends string[],
  B,
  const ExpectedB extends string[],
>(
  parserA: Parser<A, ExpectedA>,
  parserB: Parser<B, ExpectedB>,
): Parser<A, ExpectedA | ExpectedB> => map(and(parserA, parserB), ([a]) => a);
