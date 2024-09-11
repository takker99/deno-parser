import { assertEquals } from "@std/assert";
import { parse } from "./text_parser.ts";
import { text } from "./text.ts";
import { all } from "./all.ts";

Deno.test("all", () => {
  const abc = all(text("a"), text("b"), text("c"));
  assertEquals(parse(abc, "a"), {
    ok: false,
    expected: ["b"],
    location: { index: 1, line: 1, column: 2 },
  });
  assertEquals(parse(abc, "aa"), {
    ok: false,
    expected: ["b"],
    location: { index: 1, line: 1, column: 2 },
  });
  assertEquals(parse(abc, "abc"), {
    ok: true,
    value: ["a", "b", "c"],
  });
  assertEquals(parse(abc, "aaaa"), {
    ok: false,
    expected: ["b"],
    location: { index: 1, line: 1, column: 2 },
  });
  assertEquals(parse(abc, "abb"), {
    ok: false,
    expected: ["c"],
    location: { index: 2, line: 1, column: 3 },
  });
  assertEquals(parse(abc, ""), {
    ok: false,
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
  });
  assertEquals(parse(abc, "b"), {
    ok: false,
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
  });
});
