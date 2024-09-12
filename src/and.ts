import { chain } from "./chain.ts";
import { map } from "./map.ts";
import type { Parser } from "./parser.ts";

export const and = <A, B>(
  parserA: Parser<A>,
  parserB: Parser<B>,
): Parser<[A, B]> => chain(parserA, (a) => map(parserB, (b) => [a, b]));
