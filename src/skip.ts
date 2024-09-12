import { and } from "./and.ts";
import { map } from "./map.ts";
import type { Parser } from "./parser.ts";

export const skip = <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<A> =>
  map(and(parserA, parserB), ([a]) => a);
