import { assertEquals } from "@std/assert";
import { sepBy } from "./sepBy.ts";
import { text } from "./text.ts";
import { parse } from "./text_parser.ts";

Deno.test("sepBy 0+", () => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 0);
  assertEquals(parse(list, ""), { ok: true, value: [] });
  assertEquals(parse(list, "a"), { ok: true, value: ["a"] });
  assertEquals(parse(list, "a,a"), { ok: true, value: ["a", "a"] });
  assertEquals(parse(list, "a,a,a"), {
    ok: true,
    value: ["a", "a", "a"],
  });
  assertEquals(parse(list, "a,a,b"), {
    expected: ["<EOF>"],
    location: { index: 3, line: 1, column: 4 },
    ok: false,
  });
  assertEquals(parse(list, "b"), {
    expected: ["<EOF>"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});

Deno.test("sepBy 1+", () => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 1);
  assertEquals(parse(list, ""), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
  assertEquals(parse(list, "a"), { ok: true, value: ["a"] });
  assertEquals(parse(list, "a,a"), { ok: true, value: ["a", "a"] });
  assertEquals(parse(list, "a,a,a"), {
    ok: true,
    value: ["a", "a", "a"],
  });
  assertEquals(parse(list, "a,a,b"), {
    expected: ["<EOF>"],
    location: { index: 3, line: 1, column: 4 },
    ok: false,
  });
  assertEquals(parse(list, "b"), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});

Deno.test("sepBy 2-3", () => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 2, 3);
  assertEquals(parse(list, ""), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
  assertEquals(parse(list, "a"), {
    expected: [","],
    location: { index: 1, line: 1, column: 2 },
    ok: false,
  });
  assertEquals(parse(list, "a,a"), { ok: true, value: ["a", "a"] });
  assertEquals(parse(list, "a,a,a"), {
    ok: true,
    value: ["a", "a", "a"],
  });
  assertEquals(parse(list, "a,a,a,a"), {
    expected: ["<EOF>"],
    location: { index: 5, line: 1, column: 6 },
    ok: false,
  });
  assertEquals(parse(list, "a,a,b"), {
    expected: ["<EOF>"],
    location: { index: 3, line: 1, column: 4 },
    ok: false,
  });
  assertEquals(parse(list, "b"), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});

Deno.test("sepBy 1-1", () => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 1, 1);
  assertEquals(parse(list, ""), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
  assertEquals(parse(list, "a"), { ok: true, value: ["a"] });
  assertEquals(parse(list, "a,a"), {
    expected: ["<EOF>"],
    location: { index: 1, line: 1, column: 2 },
    ok: false,
  });
  assertEquals(parse(list, "b"), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
