import { or } from "./or.ts";
import { parseText as parse, type TextParser } from "./text_parser.ts";
import { text as textBase } from "./text.ts";
import { assertEquals } from "@std/assert";

type TextFn = <S extends string>(string: S) => TextParser<S, [S]>;
const text = textBase as TextFn;

Deno.test("or", () => {
  const a = text("a");
  const b = text("b");
  const ab = or(a, b);
  assertEquals(parse(ab, "a"), { ok: true, value: "a" });
  assertEquals(parse(ab, "b"), { ok: true, value: "b" });
  assertEquals(parse(ab, "c"), {
    expected: ["a", "b"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
  assertEquals(parse(ab, "ab"), {
    expected: ["<EOF>"],
    location: { index: 1, line: 1, column: 2 },
    ok: false,
  });
  assertEquals(parse(ab, ""), {
    expected: ["a", "b"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
