import type { Parser } from "./parser.ts";
import type { BaseReader } from "./reader.ts";

export const ok =
  <const A, const Reader extends BaseReader>(value: A): Parser<A, Reader> =>
  (_, ...context) => [true, context, [], value];
