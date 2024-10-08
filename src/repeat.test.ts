import { assertEquals, assertThrows } from "@std/assert";
import { parse } from "./parse.ts";
import { repeat } from "./repeat.ts";
import { sepBy } from "./sepBy.ts";
import { text } from "./text.ts";

Deno.test("repeat with bad range", () => {
  const a = text("a");
  const sep = text(" ");
  assertThrows(() => sepBy(a, sep, 5, 3), "bad range");
  assertThrows(() => sepBy(a, sep, -2, 0), "bad range");
  assertThrows(() => sepBy(a, sep, 1.2, 3.4), "bad range");
});

Deno.test("repeat 0+", () => {
  const a = text("a");
  const aaa = repeat(a);
  assertEquals(parse(aaa, ""), { ok: true, value: [] });
  assertEquals(parse(aaa, "a"), { ok: true, value: ["a"] });
  assertEquals(parse(aaa, "aa"), { ok: true, value: ["a", "a"] });
  assertEquals(parse(aaa, "aaa"), { ok: true, value: ["a", "a", "a"] });
  assertEquals(parse(aaa, "aaaa"), {
    ok: true,
    value: ["a", "a", "a", "a"],
  });
  assertEquals(parse(aaa, "b"), {
    expected: ["a", "<EOF>"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});

Deno.test("repeat 1+", () => {
  const a = text("a");
  const aaa = repeat(a, 1);
  assertEquals(parse(aaa, ""), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
  assertEquals(parse(aaa, "a"), { ok: true, value: ["a"] });
  assertEquals(parse(aaa, "aa"), { ok: true, value: ["a", "a"] });
  assertEquals(parse(aaa, "aaa"), { ok: true, value: ["a", "a", "a"] });
  assertEquals(parse(aaa, "aaaa"), {
    ok: true,
    value: ["a", "a", "a", "a"],
  });
  assertEquals(parse(aaa, "b"), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});

Deno.test("repeat 2-3", () => {
  const a = text("a");
  const aaa = repeat(a, 2, 3);
  assertEquals(parse(aaa, ""), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
  assertEquals(parse(aaa, "a"), {
    expected: ["a"],
    location: { index: 1, line: 1, column: 2 },
    ok: false,
  });
  assertEquals(parse(aaa, "aa"), { ok: true, value: ["a", "a"] });
  assertEquals(parse(aaa, "aaa"), { ok: true, value: ["a", "a", "a"] });
  assertEquals(parse(aaa, "aaaa"), {
    expected: ["<EOF>"],
    location: { index: 3, line: 1, column: 4 },
    ok: false,
  });
  assertEquals(parse(aaa, "b"), {
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});

Deno.test("repeat infinite loop detection", () => {
  const p = text("");
  const p0 = repeat(p, 0);
  const p1 = repeat(p, 1);
  assertThrows(() => parse(p0, "abc"), "infinite loop");
  assertThrows(() => parse(p1, "abc"), "infinite loop");
});
