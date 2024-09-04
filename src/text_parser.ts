import { parse, tryParse } from "./parse.ts";
import type { Parser } from "./parser.ts";
import type { Reader } from "./reader.ts";

export type TextCursor = [number, number, number];
export type TextFormattedCursor = {
  index: number;
  line: number;
  column: number;
};
export type TextReader = Reader<
  string,
  // input, current cursor, stack of backtracked cursors
  [string, TextCursor, TextCursor[]],
  TextCursor,
  string,
  TextFormattedCursor
>;
export const textReader: TextReader = [
  (input) => [input, [0, 1, 1], []],
  (data, size) => {
    if (size <= 0 || data[0] == "") return ["", data];
    let [input, [index, line, column], stack] = data;
    const popped = input.slice(index, index + size);
    const len = popped.length;
    if (len == 0) return ["", data];
    index += len;
    for (const char of popped) {
      if (char == "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
    return [popped, [input, [index, line, column], stack]];
  },
  (data) => {
    const [input, next, stack] = data;
    return [input, next, [next, ...stack]];
  },
  (data) => {
    if (data[2].length == 0) return data;
    const [input, , [prev, ...stack]] = data;
    return [input, prev, stack];
  },
  (data) => {
    if (data[2].length == 0) return data;
    const [input, next, [, ...stack]] = data;
    return [input, next, stack];
  },
  (data) => data[1],
  (data) => data[1][0] >= data[0].length,
  ([index, line, column]) => ({ index, line, column }),
];
export type TextParser<A, Expected extends string[] = string[]> = Parser<
  A,
  Expected,
  string,
  [string, TextCursor, TextCursor[]],
  TextCursor,
  string,
  TextFormattedCursor
>;
export const parseText = <A, Expected extends string[]>(
  parser: TextParser<A, Expected>,
  input: string,
) => parse(parser, textReader, input);

export const tryParseText = <A, Expected extends string[]>(
  parser: TextParser<A, Expected>,
  input: string,
) => tryParse(parser, textReader, input);