import { map } from "./map.ts";
import { parseText as parse, type TextParser } from "./text_parser.ts";
import { text } from "./text.ts";
import { assertEquals } from "@std/assert";

Deno.test("map", () => {
  const a = map(text("a") as TextParser<"a", ["a"]>, () => 1 as const);
  assertEquals(parse(a, "a"), { ok: true, value: 1 });
  assertEquals(parse(a, "b"), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
  assertEquals(parse(a, ""), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
