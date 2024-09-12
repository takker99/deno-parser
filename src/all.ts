import { chain } from "./chain.ts";
import { map } from "./map.ts";
import { ok } from "./ok.ts";
import type { Parser } from "./parser.ts";

export type JoinResults<
  ParserList extends readonly Parser<unknown>[],
> = ParserList extends [
  infer P extends Parser<unknown>,
  ...infer RestParserList extends readonly Parser<unknown>[],
] ? P extends Parser<infer A> ? [A, ...JoinResults<RestParserList>]
  : never
  : [];

export const all = <
  ParserList extends readonly Parser<unknown>[],
>(
  ...parsers: [...ParserList]
): Parser<JoinResults<ParserList>> =>
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce(
    (acc, p) => chain(acc, (array) => map(p, (value) => [...array, value])),
    ok([] as unknown[]),
  ) as Parser<JoinResults<ParserList>>;
