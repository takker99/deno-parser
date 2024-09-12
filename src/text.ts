import { type BaseLocation, type BaseReader, isEmpty, read } from "./reader.ts";
import type { Parser } from "./parser.ts";
import { makeExpected } from "./expected.ts";

export const text = <
  const S extends string,
  const Reader extends BaseReader,
>(string: S): Parser<S, Reader> =>
(reader, ...context) => {
  const res = read(string.length, reader, ...context);
  if (!isEmpty(res) && res[2] == string) {
    return [true, res[1], [], string];
  }
  return [false, context, [makeExpected(reader, context, string)]];
};

const decode = (buffer: BufferSource) => new TextDecoder().decode(buffer);

export const textInBytes = <
  const S extends string,
  const Reader extends {
    input: BufferSource;
    seeker: unknown;
    position: unknown;
    location: BaseLocation;
  },
>(string: S): Parser<S, Reader> =>
(reader, ...context) => {
  const res = read(string.length, reader, ...context);
  if (!isEmpty(res) && decode(res[2]) == string) {
    return [true, res[1], [], string];
  }
  return [false, context, [makeExpected(reader, context, string)]];
};
