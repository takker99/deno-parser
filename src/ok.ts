import type { Parser } from "./parser.ts";

export const ok = <const A>(value: A): Parser<A> => (_, ...context) => [
  true,
  context,
  [],
  value,
];
