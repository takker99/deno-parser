import { or } from "./or.ts";
import type { ParsedExpected, ParsedValue, Parser } from "./types.ts";

export type JoinExpected<
  ParserList extends readonly Parser<unknown, string[]>[],
> = ParserList extends [
  infer P extends Parser<unknown, string[]>,
  ...infer RestParserList extends readonly Parser<unknown, string[]>[],
]
  ? ParsedExpected<P> extends string[]
    ? [...ParsedExpected<P>, ...JoinExpected<RestParserList>]
  : never
  : [];

export const choice = <
  ParserList extends readonly Parser<unknown, string[]>[],
>(
  ...parsers: [...ParserList]
): Parser<
  ParsedValue<ParserList[number]>,
  JoinExpected<ParserList>
> => (
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce((acc, p) => or(acc, p)) as Parser<
    ParsedValue<ParserList[number]>,
    JoinExpected<ParserList>
  >
);
