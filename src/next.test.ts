import { assertEquals } from "@std/assert";
import { next } from "./next.ts";
import { text } from "./text.ts";
import { parse } from "./text_parser.ts";

Deno.test("next", () => {
  const ab = next(text("a"), text("b"));
  assertEquals(parse(ab, "ab"), { ok: true, value: "b" });
  assertEquals(parse(ab, "a"), {
    ok: false,
    expected: [{ expected: "b", location: { index: 1, line: 1, column: 2 } }],
  });
  assertEquals(parse(ab, "aa"), {
    ok: false,
    expected: [{ expected: "b", location: { index: 1, line: 1, column: 2 } }],
  });
  assertEquals(parse(ab, "abb"), {
    ok: false,
    expected: [{
      expected: "<EOF>",
      location: { index: 2, line: 1, column: 3 },
    }],
  });
  assertEquals(parse(ab, ""), {
    ok: false,
    expected: [{ expected: "a", location: { index: 0, line: 1, column: 1 } }],
  });
});
