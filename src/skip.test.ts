import { assertEquals } from "@std/assert";
import { skip } from "./skip.ts";
import { parseText as parse, type TextParser } from "./text_parser.ts";
import { text as textBase } from "./text.ts";

type TextFn = <S extends string>(string: S) => TextParser<S>;
const text = textBase as TextFn;

Deno.test("skip", () => {
  const ab = skip(text("a"), text("b"));
  assertEquals(parse(ab, "ab"), { ok: true, value: "a" });
  assertEquals(parse(ab, "a"), {
    ok: false,
    expected: ["b"],
    location: { index: 1, line: 1, column: 2 },
  });
  assertEquals(parse(ab, "b"), {
    ok: false,
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
  });
  assertEquals(parse(ab, ""), {
    ok: false,
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
  });
  assertEquals(parse(ab, ""), {
    ok: false,
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
  });
});
