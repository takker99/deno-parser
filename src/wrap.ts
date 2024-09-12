import { next } from "./next.ts";
import { skip } from "./skip.ts";
import type { Parser } from "./parser.ts";

export const wrap = <L, A, R>(
  parserL: Parser<L>,
  parserA: Parser<A>,
  parserR: Parser<R>,
): Parser<A> => next(parserL, skip(parserA, parserR));
