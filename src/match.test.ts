import { match } from "./match.ts";
import { parse } from "./text_parser.ts";
import { assertEquals } from "@std/assert";

Deno.test("match", () => {
  const num = match(/\d+/);
  assertEquals(parse(num, "12"), { ok: true, value: "12" });
  assertEquals(parse(num, "abc"), {
    expected: ["/\\d+/"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
  assertEquals(parse(num, ""), {
    expected: ["/\\d+/"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});

Deno.test("match with capture", () => {
  const num = match(/(\d+)/);
  assertEquals(parse(num, "12"), { ok: true, value: "12" });
  assertEquals(parse(num, "abc"), {
    expected: ["/(\\d+)/"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
  assertEquals(parse(num, ""), {
    expected: ["/(\\d+)/"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
