import { match } from "./match.ts";
import { next } from "./next.ts";
import { sepBy } from "./sepBy.ts";
import { skip } from "./skip.ts";
import {
  parseText as parse,
  type TextParser,
  tryParseText as tryParse,
} from "./text_parser.ts";
import { text as textBase } from "./text.ts";
import { assertEquals, assertThrows } from "@std/assert";

type TextFn = <S extends string>(string: S) => TextParser<S>;
const text = textBase as TextFn;

Deno.test("tryParse", () => {
  const a = text("a");
  assertEquals(tryParse(a, "a"), "a");
  assertThrows(() => tryParse(a, "b"));
});

Deno.test("lisp lists", () => {
  const symbol = match(/[a-zA-Z_-]+/);
  const lp = text("(");
  const rp = text(")");
  const ws = match(/\s+/);
  const list = skip(next(lp, sepBy(symbol, ws, 0)), rp);

  assertEquals(parse(list, "(a b c)"), { ok: true, value: ["a", "b", "c"] });
});
