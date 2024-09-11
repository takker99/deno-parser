import { chain } from "./chain.ts";
import { map } from "./map.ts";
import { ok } from "./ok.ts";
import type { ParsedExpected, Parser } from "./parser.ts";

export type JoinResults<
  ParserList extends readonly Parser<unknown, string[]>[],
> = ParserList extends [
  infer P extends Parser<unknown, string[]>,
  ...infer RestParserList extends readonly Parser<unknown, string[]>[],
]
  ? P extends Parser<infer A, infer _ extends string[]>
    ? [A, ...JoinResults<RestParserList>]
  : never
  : [];

export const all = <
  ParserList extends readonly Parser<unknown, string[]>[],
>(
  ...parsers: [...ParserList]
): Parser<
  JoinResults<ParserList>,
  ParsedExpected<ParserList[number]>
> =>
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce(
    (acc, p) => chain(acc, (array) => map(p, (value) => [...array, value])),
    ok([] as unknown[]),
  ) as Parser<
    JoinResults<ParserList>,
    ParsedExpected<ParserList[number]>
  >;
