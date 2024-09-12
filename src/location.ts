import type { ParseResult } from "./parser.ts";
import {
  type BaseReader,
  formatLocation,
  getCurrentPosition,
  type ReaderTuple,
} from "./reader.ts";

export const location = <R extends BaseReader>(
  reader: ReaderTuple<R>,
  input: R["input"],
  seeker?: R["seeker"],
): ParseResult<R["location"], R> => [
  true,
  [input, seeker],
  [],
  formatLocation(reader, getCurrentPosition(reader, [input, seeker])),
];
