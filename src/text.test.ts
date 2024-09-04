import { parseText as parse, type TextParser } from "./text_parser.ts";
import { text as textBase } from "./text.ts";
import { assertEquals } from "@std/assert";

type TextFn = <S extends string>(string: S) => TextParser<S, [S]>;
const text: TextFn = textBase;

Deno.test("test a test", () => {
  const x = text("x");
  assertEquals(parse(x, "x"), { ok: true, value: "x" });
});

Deno.test("text", () => {
  const items = ["", "abc", "🙂", "1\n2\n3"];
  for (const str of items) {
    assertEquals(parse(text(str), str), { ok: true, value: str });
  }
});
