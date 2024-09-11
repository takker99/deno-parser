// deno-fmt-ignore
import { and, choice, map, match, next, ok, or, type Parser, sepBy, skip, text, trim, } from "@takker/parser";
import { parse } from "../src/text_parser.ts";

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
const optional = <A, const Expected extends string[]>(
  parser: Parser<A, Expected>,
) => or(parser, ok(undefined));
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
const partial: Parser<Semver, string[]> = map(
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
const simple: Parser<Comparator, string[]> = map(
  choice(primitive, partial, tilde, caret),
  (v) => {
    if (!Array.isArray(v)) return { op: "=", ...v };
    const [op, partial] = v;
    return { op, ...partial };
  },
);
const hyphen: Parser<[Comparator, Comparator], string[]> = map(
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
