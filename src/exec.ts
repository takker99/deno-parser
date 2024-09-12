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
<A>(
  parser: Parser<A, Reader>,
  input: Reader["input"],
): ParseFinalResult<A, Reader["location"]> => {
  const result = skip(parser, eof)(reader, input);
  if (isOk(result)) {
    return { ok: true, value: result[3] };
  }
  return {
    ok: false,
    expected: result[2].map(([expected, location]) => ({
      expected: [...expected],
      location: formatLocation(reader, location),
    })),
  };
};

export type ParseFinalResult<
  A,
  L extends BaseLocation,
> =
  | ParseFinalOk<A>
  | ParseFinalFail<L>;

export interface ParseFinalOk<A> {
  ok: true;
  value: A;
}
export interface ParseFinalFail<L extends BaseLocation> {
  ok: false;
  expected: FinalExpected<L>[];
}

export interface FinalExpected<L extends BaseLocation> {
  expected: string[];
  location: L;
}

export const makeTryExec = <
  Reader extends BaseReader,
>(reader: ReaderTuple<Reader>) => {
  const exec = makeExec(reader);
  return <A>(parser: Parser<A, Reader>, input: Reader["input"]): A => {
    const result = exec(parser, input);
    if (result.ok) return result.value;
    const { expected } = result;
    const message = `parse error at\n${
      expected.map(({ expected, location }) =>
        `\t${location}: expected ${expected}`
      )
    }`;
    throw new Error(message);
  };
};
