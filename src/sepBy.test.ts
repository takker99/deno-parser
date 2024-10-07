import { assertEquals } from "@std/assert";
import { sepBy } from "./sepBy.ts";
import { text } from "./text.ts";
import { parse } from "./text_parser.ts";

Deno.test("sepBy 0+", () => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep);
  assertEquals(parse(list, ""), { ok: true, value: [] });
  assertEquals(parse(list, "a"), { ok: true, value: ["a"] });
  assertEquals(parse(list, "a,a"), { ok: true, value: ["a", "a"] });
  assertEquals(parse(list, "a,a,a"), {
    ok: true,
    value: ["a", "a", "a"],
  });
  assertEquals(parse(list, "a,a,b"), {
    ok: false,
    expected: [
      { expected: ["a"], location: { index: 4, line: 1, column: 5 } },
      { expected: ["<EOF>"], location: { index: 3, line: 1, column: 4 } },
    ],
  });
  assertEquals(parse(list, "b"), {
    ok: false,
    expected: [
      { expected: ["a", "<EOF>"], location: { index: 0, line: 1, column: 1 } },
    ],
  });
});

Deno.test("sepBy 1+", () => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 1);
  assertEquals(parse(list, ""), {
    ok: false,
    expected: [{ expected: ["a"], location: { index: 0, line: 1, column: 1 } }],
  });
  assertEquals(parse(list, "a"), { ok: true, value: ["a"] });
  assertEquals(parse(list, "a,a"), { ok: true, value: ["a", "a"] });
  assertEquals(parse(list, "a,a,a"), {
    ok: true,
    value: ["a", "a", "a"],
  });
  assertEquals(parse(list, "a,a,b"), {
    ok: false,
    expected: [
      { expected: ["a"], location: { index: 4, line: 1, column: 5 } },
      { expected: ["<EOF>"], location: { index: 3, line: 1, column: 4 } },
    ],
  });
  assertEquals(parse(list, "b"), {
    ok: false,
    expected: [
      { expected: ["a"], location: { index: 0, line: 1, column: 1 } },
    ],
  });
});

Deno.test("sepBy 2-3", () => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 2, 3);
  assertEquals(parse(list, ""), {
    ok: false,
    expected: [{ expected: ["a"], location: { index: 0, line: 1, column: 1 } }],
  });
  assertEquals(parse(list, "a"), {
    ok: false,
    expected: [{ expected: [","], location: { index: 1, line: 1, column: 2 } }],
  });
  assertEquals(parse(list, "a,a"), { ok: true, value: ["a", "a"] });
  assertEquals(parse(list, "a,a,a"), {
    ok: true,
    value: ["a", "a", "a"],
  });
  assertEquals(parse(list, "a,a,a,a"), {
    ok: false,
    expected: [{
      expected: ["<EOF>"],
      location: { index: 5, line: 1, column: 6 },
    }],
  });
  assertEquals(parse(list, "a,a,b"), {
    ok: false,
    expected: [
      { expected: ["a"], location: { index: 4, line: 1, column: 5 } },
      { expected: ["<EOF>"], location: { index: 3, line: 1, column: 4 } },
    ],
  });
  assertEquals(parse(list, "b"), {
    ok: false,
    expected: [{ expected: ["a"], location: { index: 0, line: 1, column: 1 } }],
  });
});

Deno.test("sepBy 1-1", () => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 1, 1);
  assertEquals(parse(list, ""), {
    ok: false,
    expected: [
      { expected: ["a"], location: { index: 0, line: 1, column: 1 } },
    ],
  });
  assertEquals(parse(list, "a"), { ok: true, value: ["a"] });
  assertEquals(parse(list, "a,a"), {
    ok: false,
    expected: [{
      expected: ["<EOF>"],
      location: { index: 1, line: 1, column: 2 },
    }],
  });
  assertEquals(parse(list, "b"), {
    ok: false,
    expected: [
      { expected: ["a"], location: { index: 0, line: 1, column: 1 } },
    ],
  });
});
