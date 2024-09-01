import { assertEquals } from "@std/assert";
import { choice } from "./choice.ts";
import { map } from "./map.ts";
import { parse } from "./parse.ts";
import { text } from "./text.ts";

Deno.test("choice", () => {
  const abc123 = choice(
    text("a"),
    text("b"),
    text("c"),
    map(text("1"), () => 1 as const),
    map(text("2"), () => 2 as const),
    map(text("3"), () => 3 as const),
  );

  assertEquals(parse(abc123, "a"), { ok: true, value: "a" });
  assertEquals(parse(abc123, "b"), { ok: true, value: "b" });
  assertEquals(parse(abc123, "c"), { ok: true, value: "c" });
  assertEquals(parse(abc123, "1"), { ok: true, value: 1 });
  assertEquals(parse(abc123, "2"), { ok: true, value: 2 });
  assertEquals(parse(abc123, "3"), { ok: true, value: 3 });
  assertEquals(parse(abc123, "aaaa"), {
    expected: ["<EOF>"],
    location: { index: 1, line: 1, column: 2 },
    ok: false,
  });
  assertEquals(parse(abc123, "abb"), {
    expected: ["<EOF>"],
    location: { index: 1, line: 1, column: 2 },
    ok: false,
  });
  assertEquals(parse(abc123, ""), {
    expected: ["a", "b", "c", "1", "2", "3"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
