import { assertEquals } from "@std/assert";
import { parse } from "./parse.ts";
import { text } from "./text.ts";
import { wrap } from "./wrap.ts";

Deno.test("wrap", () => {
  const p = wrap(text("<"), text("x"), text(">"));
  assertEquals(parse(p, "<x>"), { ok: true, value: "x" });
  assertEquals(parse(p, "<x"), {
    expected: [">"],
    location: { index: 2, line: 1, column: 3 },
    ok: false,
  });
  assertEquals(parse(p, "<"), {
    expected: ["x"],
    location: { index: 1, line: 1, column: 2 },
    ok: false,
  });
  assertEquals(parse(p, "x>"), {
    expected: ["<"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
