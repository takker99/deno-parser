import type { Parser } from "./parser.ts";

export const ok = <
  A,
  const Expected extends string[] = never,
>(
  value: A,
): Parser<A, Expected> =>
(_, ...context) => [true, context, value];
