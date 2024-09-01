# deno-parser

[![JSR](https://jsr.io/badges/@takker/parser)](https://jsr.io/@takker/parser)
[![test](https://github.com/takker99/deno-parser/workflows/ci/badge.svg)](https://github.com/takker99/deno-parser/actions?query=workflow%3Aci)

This is a fork of [bread-n-butter](https://github.com/wavebeem/bread-n-butter),
a parser combinator library for JavaScript and TypeScript.

# Features

I only introduce those which differ from the bread-n-butter:

- [x] making it work with Deno
- [x] reducing the bundle size
  - ```sh
    $ deno run -A jsr:@takker/esbuild-deno-cli@0.1.0-rc.5 mod.ts npm:bread-n-butter@0.6.0 --bundle --minify --format=esm --outdir=./dist

      dist/npm_bread-n-butter@0.6.js  4.1kb
      dist/mod.js                     3.2kb

    ⚡ Done in 137ms
    ```
- [x] function-based API, including no class.
- [x] parse whatever type of source extends `ArrayLike<unknown>`
- [ ] provide combinators useful for parsing binary data

# Usage

## Text Parser

## Math Expression Parser:

```ts
// deno-fmt-ignore
import { all, choice, lazy, map, match, next, parse, type Parser, text, trim, wrap, } from "@takker/parser";

const ws = match(/\s*/);
const token = <S extends string>(str: S) => trim(text(str), ws);
const digit = map(trim(match(/[1-9]\d*(\.\d+)?/), ws), Number);
const expr: Parser<number> = lazy(() =>
  choice(add, sub, mul, div, plus, minus, digit)
);
const term: Parser<number> = lazy(() =>
  choice(wrap(token("("), expr, token(")")), digit)
);
const termMul: Parser<number> = lazy(() => choice(mul, div, term));
const mul = map(all(term, token("*"), termMul), ([l, , r]) => l * r);
const div = map(all(term, text("/"), termMul), ([l, , r]) => l / r);
const add = map(all(termMul, token("+"), termMul), ([l, , r]) => l + r);
const sub = map(all(termMul, token("-"), termMul), ([l, , r]) => l - r);
const plus = next(token("+"), term);
const minus = map(next(token("-"), term), (d) => -d);

const calc = (input: string) => parse(expr, input);

console.log(calc("1")); // => 1
console.log(calc("1+2")); // => 3
console.log(calc("1 + 2 * 3")); // => 7
console.log(calc("(8 * 4 -3) * (10 /2 +3)")); // => 232
```

### SemVer Range Parser (partial):

```ts
// deno-fmt-ignore
import { and, choice, map, match, next, ok, or, parse, type Parser, sepBy, skip, text, trim, } from "@takker/parser";

const nr = or(text("0"), match(/[1-9]\d*/));
const part = or(nr, match(/[-0-9A-Za-z]+/));
const parts = map(sepBy(part, text("."), 1), (p) => p.join("."));
const pre = parts;
const build = parts;
const xr = or(
  map(choice(text("x"), text("X"), text("*")), () => "*" as const),
  map(nr, parseInt),
);
const dotXr = next(text("."), xr);
const optional = <A>(parser: Parser<A>) => or(parser, ok(undefined));
interface Semver {
  major: number | "*";
  minor?: number | "*";
  patch?: number | "*";
  prelease?: string;
  build?: string;
}
const qualifier = map(
  and(
    optional(next(text("-"), pre)),
    optional(next(text("+"), build)),
  ),
  ([prelease, build]) => {
    const obj: Pick<Semver, "prelease" | "build"> = {};
    if (prelease) obj.prelease = prelease;
    if (build) obj.build = build;
    return obj;
  },
);
const partial: Parser<Semver> = map(
  and(xr, optional(and(dotXr, optional(and(dotXr, optional(qualifier)))))),
  ([major, rest]) => {
    const [minor, rest2] = rest ?? [];
    const [patch, qualifier] = rest2 ?? [];
    return {
      major,
      minor,
      patch,
      ...(qualifier ?? {}),
    };
  },
);
const tilde = and(text("~"), partial);
const caret = and(text("^"), partial);
const primitive = and(
  choice(text("<"), text(">"), text(">="), text("<="), text("=")),
  partial,
);
interface Comparator extends Semver {
  op: "<" | ">" | ">=" | "<=" | "=" | "~" | "^";
}
const simple: Parser<Comparator> = map(
  choice(primitive, partial, tilde, caret),
  (v) => {
    if (!Array.isArray(v)) return { op: "=", ...v };
    const [op, partial] = v;
    return { op, ...partial };
  },
);
const hyphen: Parser<[Comparator, Comparator]> = map(
  and(skip(partial, text(" - ")), partial),
  ([start, end]) => [{ op: ">=", ...start }, { op: "<=", ...end }],
);
const range = choice(hyphen, sepBy(simple, text(" "), 1), text(""));
const ws = match(/\s*/);
const rangeSet = map(
  sepBy(range, trim(text("||"), ws)),
  (ranges) => ranges.map((range) => range === "" ? [] : range),
);

const parseRange = (input: string) => parse(rangeSet, input);

console.log(parseRange("1.2.3 - 2.3.4 || 1.2.3-alpha.3"));
/*=> {
  ok: true,
  value: [
    [{ op: ">=", major: 1, minor: 2, patch: 3 }, { op: "<=", major: 2, minor: 3, patch: 4 }],
    [{ op: "=", major: 1, minor: 2, patch: 3, prelease: "alpha.3" }]
  ]
} */
```

For more long examples, see [examples](./examples). If you want to just see the
API or simple examples, see each JSDoc in the source code.

## Binary Parser

_Coming soon..._

---

The following is the original README of bread-n-butter.

# bread-n-butter

bread-n-butter (bnb) is a parser combinator library for JavaScript and
TypeScript.

bnb is semver v0, but unlikely to change much. It should be a stable platform
for development.

Eventually bnb's concepts will become
[Parsimmon v2](https://github.com/jneen/parsimmon/issues/230)

- [Documentation](https://bnb-wavebeem.netlify.app/)
- [Changelog](https://github.com/wavebeem/bread-n-butter/blob/main/CHANGELOG.md)
- [Code of Conduct](https://github.com/wavebeem/bread-n-butter/blob/main/CODE_OF_CONDUCT.md)
- [npm](https://www.npmjs.com/package/bread-n-butter)
