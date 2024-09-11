import { type BaseReader, isEmpty, type Parser, read } from "./types.ts";

export interface ArrayLikeReader extends BaseReader {
  input: ArrayLike<unknown>;
}

export const digits = <
  N extends unknown[],
  Reader extends ArrayLikeReader,
>(
  digits: [...N],
): Parser<[...N], [string], Reader> =>
(reader, ...context) => {
  const res = read(digits.length, reader, ...context);
  if (isEmpty(res)) return [false, context, [digits.join(",")]];
  const [, next, sliced] = res;
  for (let i = 0; i < digits.length; i++) {
    if (sliced![i] != digits[i]) {
      return [false, next, [`${digits[i]}`]];
    }
  }
  return [true, next, digits];
};
