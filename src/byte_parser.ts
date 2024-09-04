import { parse } from "./parse.ts";
import type { Parser } from "./parser.ts";
import type { Reader } from "./reader.ts";

export type ByteReader = Reader<
  Uint8Array,
  [Uint8Array, number, number[]],
  number,
  Uint8Array,
  number
>;
export const byteReader: ByteReader = [
  (input) => [input, 0, []],
  (data, size) => {
    const [input, index, stack] = data;
    const len = input.length;
    size = Math.min(size, input.length - index);
    if (size <= 0 || len <= 0) return [new Uint8Array(), data];
    const popped = input.subarray(index, index + size);
    return [popped, [input, index + size, stack]];
  },
  (data) => {
    const [input, cursor, stack] = data;
    return [input, cursor, [cursor, ...stack]];
  },
  (data) => {
    if (data[2].length == 0) return data;
    const [input, , [prev, ...stack]] = data;
    return [input, prev, stack];
  },
  (data) => data[1],
  (data) => data[1] >= data[0].length,
  (cursor) => cursor,
];
export type ByteParser<A, Expected extends string[] = string[]> = Parser<
  A,
  Expected,
  Uint8Array,
  [Uint8Array, number, number[]],
  number,
  Uint8Array,
  number
>;
export const parseBytes = <A, Expected extends string[]>(
  parser: ByteParser<A, Expected>,
  input: Uint8Array,
) => parse(parser, byteReader, input);
