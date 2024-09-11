import { eof } from "./eof.ts";
import { skip } from "./skip.ts";
import {
  type BaseLocation,
  type BaseReader,
  formatLocation,
  type ReaderTuple,
} from "./reader.ts";
import { isOk, type Parser } from "./parser.ts";

export const makeExec = <
  Reader extends BaseReader,
>(reader: ReaderTuple<Reader>) =>
<A, const Expected extends string[]>(
  parser: Parser<A, Expected, Reader>,
  input: Reader["input"],
): ParseFinalResult<A, Expected | ["<EOF>"], Reader["location"]> => {
  const result = skip(parser, eof)(reader, input);
  if (isOk(result)) {
    return { ok: true, value: result[2] };
  }
  return {
    ok: false,
    location: formatLocation(reader, result[1]),
    expected: result[2],
  };
};

export type ParseFinalResult<A, Expected, L extends BaseLocation> =
  | ParseFinalOk<A>
  | ParseFinalFail<Expected, L>;

export interface ParseFinalOk<A> {
  ok: true;
  value: A;
}
export interface ParseFinalFail<Expected, L extends BaseLocation> {
  ok: false;
  expected: Expected;
  location: L;
}

export const makeTryExec = <
  Reader extends BaseReader,
>(reader: ReaderTuple<Reader>) => {
  const exec = makeExec(reader);
  return <A, const Expected extends string[]>(
    parser: Parser<A, Expected, Reader>,
    input: Reader["input"],
  ): A => {
    const result = exec(parser, input);
    if (result.ok) return result.value;
    const { expected, location } = result;
    const message = `parse error at ${location}: ` +
      `expected ${expected.join(", ")}`;
    throw new Error(message);
  };
};
