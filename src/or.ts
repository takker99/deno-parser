import { drop, pop, save } from "./reader.ts";
import { isOk, merge, type Parser } from "./parser.ts";

export const or =
  <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<A | B> =>
  (reader, ...context) => {
    const a = parserA(reader, ...save(reader, context));
    const next = a[1];
    if (isOk(a)) {
      return [true, drop(reader, next), a[2], a[3]];
    }
    return merge(reader, a, parserB(reader, ...pop(reader, next)));
  };
