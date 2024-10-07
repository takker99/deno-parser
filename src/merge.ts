import { mergeExpected } from "./expected.ts";
import type { ParseResult } from "./parse.ts";

/**
 * @internal
 *
 * @param a
 * @param b
 * @returns
 */

export const merge = <const A, const B>(
  a: ParseResult<A>,
  b: ParseResult<B>,
): ParseResult<B> => {
  const expectedB = mergeExpected(...b.expected);
  const minPos = expectedB.at(-1)?.location;
  const expectedA = minPos
    ? a.expected.filter(({ location }) => minPos.index <= location.index)
    : a.expected;
  const expected = mergeExpected(...expectedA, ...expectedB);
  return (b.ok
    ? {
      ok: true,
      value: b.value,
      next: b.next,
      expected,
    }
    : {
      ok: false,
      expected,
    });
};
