import { assertEquals } from "@std/assert";
import { assertType, type IsExact } from "@std/testing/types";
import { parse } from "./text_parser.ts";
import { text } from "./text.ts";
import { all, type JoinParsers } from "./all.ts";
import type { Parser } from "./parser.ts";

Deno.test("JoinParsers", () => {
  assertType<
    IsExact<
      JoinParsers<
        [
          Parser<string>,
          Parser<number>,
          Parser<"test">,
          Parser<["a", "b", "c", Set<number>]>,
        ]
      >,
      Parser<[string, number, "test", ["a", "b", "c", Set<number>]]>
    >
  >(true);
  assertType<IsExact<JoinParsers<[]>, Parser<[]>>>(true);
});

Deno.test("all", () => {
  const abc = all(text("a"), text("b"), text("c"));
  assertEquals(parse(abc, "a"), {
    ok: false,
    expected: [{ expected: ["b"], location: { index: 1, line: 1, column: 2 } }],
  });
  assertEquals(parse(abc, "aa"), {
    ok: false,
    expected: [{ expected: ["b"], location: { index: 1, line: 1, column: 2 } }],
  });
  assertEquals(parse(abc, "abc"), {
    ok: true,
    value: ["a", "b", "c"],
  });
  assertEquals(parse(abc, "aaaa"), {
    ok: false,
    expected: [{ expected: ["b"], location: { index: 1, line: 1, column: 2 } }],
  });
  assertEquals(parse(abc, "abb"), {
    ok: false,
    expected: [{ expected: ["c"], location: { index: 2, line: 1, column: 3 } }],
  });
  assertEquals(parse(abc, ""), {
    ok: false,
    expected: [{ expected: ["a"], location: { index: 0, line: 1, column: 1 } }],
  });
  assertEquals(parse(abc, "b"), {
    ok: false,
    expected: [{ expected: ["a"], location: { index: 0, line: 1, column: 1 } }],
  });
});
