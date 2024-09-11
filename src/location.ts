import type { ParseResult } from "./parser.ts";
import { type BaseReader, formatLocation, type ReaderTuple } from "./reader.ts";

export const location = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  input: R["input"],
  seeker?: R["seeker"],
): ParseResult<R["location"], never, R> => [
  true,
  [input, seeker],
  formatLocation(reader, [input, seeker]),
];
