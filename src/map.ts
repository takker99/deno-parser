import { chain } from "./chain.ts";
import { ok } from "./ok.ts";
import type { Parser } from "./parser.ts";

export const map = <A, const B>(
  parser: Parser<A>,
  fn: (value: A) => B,
): Parser<B> => chain(parser, (a) => ok(fn(a)));
