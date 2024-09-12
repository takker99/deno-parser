import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./parser.ts";

export const next = <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<B> =>
  map(and(parserA, parserB), ([, b]) => b);
