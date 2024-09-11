import { formatLocation } from "./types.ts";
import type { BaseReader, ParseResult, ReaderTuple } from "./types.ts";

export const location = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  input: R["input"],
  seeker?: R["seeker"],
): ParseResult<R["location"], never, R> => [
  true,
  [input, seeker],
  formatLocation(reader, [input, seeker]),
];
