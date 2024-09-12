import { type BaseReader, formatLocation, isEmpty, read } from "./reader.ts";
import type { Parser } from "./parser.ts";

export interface ArrayLikeReader extends BaseReader {
  input: ArrayLike<unknown>;
}

export const digits = <
  N extends unknown[],
  Reader extends ArrayLikeReader,
>(
  digits: [...N],
): Parser<[...N], Reader> =>
(reader, ...context) => {
  const res = read(digits.length, reader, ...context);
  const next = res[1];
  const location = formatLocation(reader, context);
  if (isEmpty(res)) return [false, context, [[digits.join(","), location]]];
  const sliced = res[2];
  const mismatched = digits.findIndex((d, i) => sliced![i] != d);
  if (mismatched < 0) {
    return [false, next, [[`${digits[mismatched]}`, location]]];
  }
  return [true, next, [], digits];
};
