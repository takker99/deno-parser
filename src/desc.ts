import { isOk, type Parser } from "./parser.ts";
import {
  type BaseReader,
  type Context,
  formatLocation,
  type ReaderTuple,
} from "./reader.ts";

export const desc = <
  A,
>(
  parser: Parser<A>,
  expected: string[],
): Parser<A> =>
<R extends BaseReader>(reader: ReaderTuple<R>, ...context: Context<R>) => {
  const result = parser(reader, ...context);
  if (isOk(result)) return result;
  return [
    false,
    result[1],
    expected.map((e) => [e, formatLocation(reader, result[1])]),
  ];
};
