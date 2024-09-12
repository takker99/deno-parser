import { chain } from "./chain.ts";
import { ok } from "./ok.ts";
import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

export const map = <A, const B, const Reader extends BaseReader>(
  parser: Parser<A, Reader>,
  fn: (value: A) => B,
): Parser<B, Reader> => chain(parser, (a) => ok(fn(a)));
