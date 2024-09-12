import type { Parser } from "./parser.ts";

export const lazy = <A>(fn: () => Parser<A>): Parser<A> =>
// NOTE: This parsing action overwrites itself on the specified parser. We're
// assuming that the same parser won't be returned to multiple `lazy` calls. I
// never heard of such a thing happening in Parsimmon, and it doesn't seem
// likely to happen here either. I assume this is faster than using variable
// closure and an `if`-statement here, but I honestly don't know.
(...args) => fn()(...args);
