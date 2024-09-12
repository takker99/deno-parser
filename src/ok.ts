import type { Parser } from "./parser.ts";

export const ok =
  <A>(value: A): Parser<A> => (_, ...context) => [true, context, [], value];
