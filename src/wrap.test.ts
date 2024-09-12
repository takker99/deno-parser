import { assertEquals } from "@std/assert";
import { wrap } from "./wrap.ts";
import { text } from "./text.ts";
import { parse } from "./text_parser.ts";

Deno.test("wrap", () => {
  const p = wrap(text("<"), text("x"), text(">"));
  assertEquals(parse(p, "<x>"), { ok: true, value: "x" });
  assertEquals(parse(p, "<x"), {
    ok: false,
    expected: [{ expected: ">", location: { index: 2, line: 1, column: 3 } }],
  });
  assertEquals(parse(p, "<"), {
    ok: false,
    expected: [{ expected: "x", location: { index: 1, line: 1, column: 2 } }],
  });
  assertEquals(parse(p, "x>"), {
    ok: false,
    expected: [{ expected: "<", location: { index: 0, line: 1, column: 1 } }],
  });
});
