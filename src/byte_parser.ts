import { makeExec, makeTryExec, type ParseFinalResult } from "./exec.ts";
import type { BaseLocation, ReaderTuple } from "./reader.ts";
import type { Parser } from "./parser.ts";

export type ByteSeeker = readonly [index: number, stack: readonly number[]];
export interface ByteLocation extends BaseLocation {}
export interface ByteReader {
  input: Uint8Array;
  seeker: ByteSeeker;
  location: ByteLocation;
}
const initialSeeker: ByteSeeker = [0, []];
const byteReader: ReaderTuple<ByteReader> = [
  initialSeeker,
  (context, size) => {
    if (size == 0) return [false, context, new Uint8Array()];
    const [input, seeker] = context;
    const len = input.length;
    const [index, stack] = seeker ?? initialSeeker;
    size = Math.min(size, input.length - index);
    if (size < 0 || len <= 0) return [true, context];
    const popped = input.subarray(index, index + size);
    return [false, [input, [index + size, stack]], popped];
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
  ([input, seeker]) => (seeker?.[0] ?? 0) >= input.length,
  (a, b) => a[0] - b[0],
  ([index]) => ({ index }),
];

export const parse: <A, const Expected extends string[]>(
  parser: Parser<A, Expected, ByteReader>,
  input: Uint8Array,
) => ParseFinalResult<A, Expected | ["<EOF>"], ByteLocation> =
  /* #__PURE__ */ makeExec(byteReader);

export const tryParse: <A, const Expected extends string[]>(
  parser: Parser<A, Expected, ByteReader>,
  input: Uint8Array,
) => A = /* #__PURE__ */ makeTryExec(byteReader);
