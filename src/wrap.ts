import { next } from "./next.ts";
import { skip } from "./skip.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

export const wrap = <L, A, R, const Reader extends BaseReader>(
  parserL: Parser<L, Reader>,
  parserA: Parser<A, Reader>,
  parserR: Parser<R, Reader>,
): Parser<A, Reader> => next(parserL, skip(parserA, parserR));
