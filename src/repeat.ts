import { isRangeValid } from "./isRangeValid.ts";
import {
  type BaseReader,
  compare,
  type Context,
  discardPreviousPosition,
  isDone,
  isOk,
  type Parser,
  type ReaderTuple,
  restorePreviousPosition,
  saveCurrentPosition,
} from "./types.ts";

export const repeat = <
  A,
  Expected extends string[],
>(
  parser: Parser<A, Expected>,
  min = 0,
  max = Infinity,
): Parser<A[], Expected> => {
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

      const result = parser(reader, ...saveCurrentPosition(reader, next));
      prev = next;
      const is = isOk(result);
      const isLack = items.length < min;
      next = (is || isLack ? discardPreviousPosition : restorePreviousPosition)(
        reader,
        result[1],
      );
      if (!is) {
        if (isLack) return result;
        break;
      }
      if (
        compare(reader, prev, next) == 0 &&
        max == Infinity && !isDone(reader, next)
      ) {
        throw new Error(
          "infinite loop detected; don't call .repeat() with parsers that can accept zero characters",
        );
      }
      items.push(result[2]);
    }
    return [true, next, items];
  };
};
