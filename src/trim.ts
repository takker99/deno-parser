import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";
import { wrap } from "./wrap.ts";

export const trim = <A, B, const Reader extends BaseReader>(
  parser: Parser<A, Reader>,
  beforeAndAfter: Parser<B, Reader>,
): Parser<A, Reader> => wrap(beforeAndAfter, parser, beforeAndAfter);
