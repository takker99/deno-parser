import { type BaseLocation, isEmpty, type Parser, read } from "./types.ts";

export const text = <
  const S extends string,
>(string: S): Parser<S, [S]> =>
(reader, ...context) => {
  const res = read(string.length, reader, ...context);
  if (!isEmpty(res) && res[2] == string) {
    return [true, res[1], string];
  }
  return [false, context, [string]];
};

const decode = (buffer: BufferSource) => new TextDecoder().decode(buffer);

export const textInBytes = <
  const S extends string,
  R extends { input: BufferSource; seeker: unknown; location: BaseLocation },
>(string: S): Parser<S, [S], R> =>
(reader, ...context) => {
  const res = read(string.length, reader, ...context);
  if (!isEmpty(res) && decode(res[2]!) == string) {
    return [true, res[1], string];
  }
  return [false, context, [string]];
};
