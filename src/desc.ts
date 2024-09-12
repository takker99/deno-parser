import { isOk, type Parser } from "./parser.ts";
import { makeExpected } from "./expected.ts";
import type { BaseReader, Context, ReaderTuple } from "./reader.ts";

export const desc = <
  A,
  const Reader extends BaseReader,
>(
  parser: Parser<A, Reader>,
  expected: string[],
): Parser<A, Reader> =>
<R extends Reader>(reader: ReaderTuple<R>, ...context: Context<R>) => {
  const result = parser(reader, ...context);
  if (isOk(result)) return result;
  return [
    false,
    result[1],
    [makeExpected(reader, result[1], ...expected)],
  ];
};
