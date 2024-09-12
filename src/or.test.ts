import { or } from "./or.ts";
import { assertEquals } from "@std/assert";
import { text } from "./text.ts";
import { parse } from "./text_parser.ts";

Deno.test("or", () => {
  const a = text("a");
  const b = text("b");
  const ab = or(a, b);
  assertEquals(parse(ab, "a"), { ok: true, value: "a" });
  assertEquals(parse(ab, "b"), { ok: true, value: "b" });
  assertEquals(parse(ab, "c"), {
    expected: [
      { expected: "a", location: { index: 0, line: 1, column: 1 } },
      { expected: "b", location: { index: 0, line: 1, column: 1 } },
    ],
    ok: false,
  });
  assertEquals(parse(ab, "ab"), {
    expected: [
      { expected: "<EOF>", location: { index: 1, line: 1, column: 2 } },
    ],
    ok: false,
  });
  assertEquals(parse(ab, ""), {
    expected: [
      { expected: "a", location: { index: 0, line: 1, column: 1 } },
      { expected: "b", location: { index: 0, line: 1, column: 1 } },
    ],
    ok: false,
  });
});
