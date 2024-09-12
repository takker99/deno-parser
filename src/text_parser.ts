import { makeExec, makeTryExec, type ParseFinalResult } from "./exec.ts";
import type { BaseLocation, ReaderTuple } from "./reader.ts";
import type { Parser } from "./parser.ts";

export type TextPosition = readonly [
  index: number,
  line: number,
  column: number,
];
export type TextSeeker = readonly [
  currentPosition: TextPosition,
  stack: readonly TextPosition[],
];
export interface TextLocation extends BaseLocation {
  line: number;
  column: number;
}
export interface TextReader {
  position: TextPosition;
  input: string;
  seeker: TextSeeker;
  location: TextLocation;
}
const initialSeeker: TextSeeker = [[0, 1, 1], []];
const textReader: ReaderTuple<TextReader> = [
  initialSeeker,
  (context, size) => {
    if (size == 0) return [false, context, ""];
    const [input, seeker] = context;
    if (size < 0 || input == "") return [true, context];
    let [[index, line, column], stack] = seeker ?? initialSeeker;
    const sliced = input.slice(index, index + size);
    const len = sliced.length;
    if (len == 0) return [true, context];
    index += len;
    for (const char of sliced) {
      if (char == "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
    return [false, [input, [[index, line, column], stack]], sliced];
  },
  ([cur, stack]) => [cur, [cur, ...stack]],
  (seeker) => {
    if (seeker[1].length === 0) return seeker;
    const [, [prev, ...stack]] = seeker;
    return [prev, stack];
  },
  (seeker) => {
    if (seeker[1].length === 0) return seeker;
    const [cur, [, ...stack]] = seeker;
    return [cur, stack];
  },
  ([input, seeker]) => (seeker?.[0]?.[0] ?? 0) >= input.length,
  (a, b) => a[0][0] - b[0][0],
  ([[index, line, column]]) => ({ index, line, column }),
];

export const parse: <A>(
  parser: Parser<A, TextReader>,
  input: string,
) => ParseFinalResult<A, TextLocation> = /* #__PURE__ */ makeExec(textReader);

export const tryParse: <A>(parser: Parser<A, TextReader>, input: string) => A =
  /* #__PURE__ */ makeTryExec(textReader);
