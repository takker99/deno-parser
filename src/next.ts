import { chain } from "./chain.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

export const next = <A, B, const Reader extends BaseReader>(
  parserA: Parser<A, Reader>,
  parserB: Parser<B, Reader>,
): Parser<B, Reader> => chain(parserA, () => parserB);
