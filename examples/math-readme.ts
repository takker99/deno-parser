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
