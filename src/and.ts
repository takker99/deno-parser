import { isOk, merge, type Parser } from "./parser.ts";

export const and =
  <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<[A, B]> =>
  (reader, ...prev) => {
    const a = parserA(reader, ...prev);
    if (!isOk(a)) return a;
    return merge(a, parserB(reader, ...a[1]), (b) => [a[3], b]);
  };
