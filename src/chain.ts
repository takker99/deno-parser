import { isOk, merge, type Parser } from "./parser.ts";

export const chain = <A, B>(
  parser: Parser<A>,
  fn: (value: A) => Parser<B>,
): Parser<B> =>
(reader, ...context) => {
  const a = parser(reader, ...context);
  if (!isOk(a)) return a;
  return merge(a, fn(a[3])(reader, ...a[1]));
};
