import { fail } from "./fail.ts";
import { or } from "./or.ts";
import { parse } from "./text_parser.ts";
import { text } from "./text.ts";
import { assertEquals } from "@std/assert";

Deno.test("fail", () => {
  const p = fail(["apple", "banana"]);
  const q = or(text("other"), p);
  assertEquals(parse(p, ""), {
    ok: false,
    expected: [
      {
        expected: ["apple", "banana"],
        location: { index: 0, line: 1, column: 1 },
      },
    ],
  });
  assertEquals(parse(q, ""), {
    ok: false,
    expected: [
      {
        expected: ["other", "apple", "banana"],
        location: { index: 0, line: 1, column: 1 },
      },
    ],
  });
});
