import { parseText as parse, type TextParser } from "./text_parser.ts";
import { text as textBase } from "./text.ts";
import { wrap } from "./wrap.ts";
import { assertEquals } from "@std/assert";

type TextFn = <S extends string>(string: S) => TextParser<S>;
const text = textBase as TextFn;

Deno.test("wrap", () => {
  const p = wrap(text("<"), text("x"), text(">"));
  assertEquals(parse(p, "<x>"), { ok: true, value: "x" });
  assertEquals(parse(p, "<x"), {
    expected: [">"],
    location: { index: 2, line: 1, column: 3 },
    ok: false,
  });
  assertEquals(parse(p, "<"), {
    expected: ["x"],
    location: { index: 1, line: 1, column: 2 },
    ok: false,
  });
  assertEquals(parse(p, "x>"), {
    expected: ["<"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
