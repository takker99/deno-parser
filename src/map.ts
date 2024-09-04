import { chain } from "./chain.ts";
import type { DeepReadonly } from "./deep_readonly.ts";
import { ok } from "./ok.ts";
import type { Parser } from "./parser.ts";

/**
 * Yields the result of calling `fn` with the parser's value.
 *
 * @example
 * ```ts
 * import { map, match, or, text, tryParse } from "@takker/parser";
 *
 * const num = map(match(/[0-9]+/), (str) => Number(str));
 * tryParse(num, "1312"); // => 1312
 * tryParse(num, "777"); // =>  777
 *
 * const yes = map(text("yes"), () => true as const);
 * const no = map(text("no"), () => false as const);
 * const bool = or(yes, no);
 * tryParse(bool, "yes"); // => true
 * tryParse(bool, "no"); // => false
 * ```
 */
export const map = <
  A,
  const ExpectedA extends string[],
  B,
  Input,
  Data,
  Cursor,
  T,
  FormattedCursor,
>(
  parser: Parser<A, ExpectedA, Input, Data, Cursor, T, FormattedCursor>,
  fn: (value: DeepReadonly<A>) => DeepReadonly<B>,
): Parser<B, ExpectedA, Input, Data, Cursor, T, FormattedCursor> =>
  chain(parser, (a) => ok(fn(a)));
