import { assertEquals } from "@std/assert";
import { trim } from "./trim.ts";
import { text } from "./text.ts";
import { parse } from "./text_parser.ts";

Deno.test("trim", () => {
  const p = trim(text("x"), text("~"));
  assertEquals(parse(p, "~x~"), { ok: true, value: "x" });
  assertEquals(parse(p, "~x"), {
    expected: ["~"],
    location: { index: 2, line: 1, column: 3 },
    ok: false,
  });
  assertEquals(parse(p, "~"), {
    expected: ["x"],
    location: { index: 1, line: 1, column: 2 },
    ok: false,
  });
  assertEquals(parse(p, "x>"), {
    expected: ["~"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
