import { isRangeValid } from "./isRangeValid.ts";
import {
  type BaseReader,
  compare,
  type Context,
  drop,
  isDone,
  pop,
  type ReaderTuple,
  save,
} from "./reader.ts";
import { isOk, type Parser } from "./parser.ts";

export const repeat = <
  A,
>(
  parser: Parser<A>,
  min = 0,
  max = Infinity,
): Parser<A[]> => {
  if (!isRangeValid(min, max)) {
    throw new Error(`repeat: bad range (${min} to ${max})`);
  }
  return <R extends BaseReader>(
    reader: ReaderTuple<R>,
    ...start: Context<R>
  ) => {
    const items: A[] = [];
    let prev = start;
    let next = start;
    while (true) {
      if (items.length >= max) break;

      const result = parser(reader, ...save(reader, next));
      prev = next;
      const ok = isOk(result);
      const isLack = items.length < min;
      next = (!ok && !isLack ? pop : drop)(reader, result[1]);
      if (!ok) {
        if (!isLack) return [true, next, result[2], items];
        return result;
      }
      if (
        compare(reader, prev, next) == 0 &&
        max == Infinity && !isDone(reader, next)
      ) {
        throw new Error(
          "infinite loop detected; don't call .repeat() with parsers that can accept zero characters",
        );
      }
      items.push(result[3]);
    }
    return [true, next, [], items];
  };
};
