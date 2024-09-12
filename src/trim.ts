import type { Parser } from "./parser.ts";
import { wrap } from "./wrap.ts";

export const trim = <A, B>(
  parser: Parser<A>,
  beforeAndAfter: Parser<B>,
): Parser<A> => wrap(beforeAndAfter, parser, beforeAndAfter);
