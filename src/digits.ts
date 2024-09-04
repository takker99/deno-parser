import type { DeepReadonly } from "./deep_readonly.ts";
import type { Parser } from "./parser.ts";
import { getNextCursor, pop } from "./reader.ts";

export const digits = <
  N extends unknown[],
  Input,
  Data,
  Cursor,
  T extends ArrayLike<N[number]>,
  FormattedCursor,
>(
  digits: DeepReadonly<[...N]>,
): Parser<[...N], [string], Input, Data, Cursor, T, FormattedCursor> =>
(reader, data) => {
  const [sliced, next] = pop(reader, data, digits.length);
  for (let i = 0; i < digits.length; i++) {
    if (sliced != digits[i]) {
      return [false, getNextCursor(reader, data), next, [`${digits[i]}`]];
    }
  }
  return [true, digits, next];
};
