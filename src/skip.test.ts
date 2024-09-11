import { assertEquals } from "@std/assert";
import { skip } from "./skip.ts";
import { text } from "./text.ts";
import { parse } from "./text_parser.ts";

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
