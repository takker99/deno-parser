import { map } from "./map.ts";
import { parse } from "./parse.ts";
import { text } from "./text/text.ts";
import { assertEquals } from "@std/assert";

Deno.test("map", () => {
  const a = map(text("a"), () => 1 as const);
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
