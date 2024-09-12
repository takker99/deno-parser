import { or } from "./or.ts";
import type { ParsedValue, Parser } from "./parser.ts";

export const choice = <
  ParserList extends readonly Parser<unknown>[],
>(
  ...parsers: [...ParserList]
): Parser<ParsedValue<ParserList[number]>> => (
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce((acc, p) => or(acc, p)) as Parser<
    ParsedValue<ParserList[number]>
  >
);
