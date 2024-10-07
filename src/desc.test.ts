import { desc } from "./desc.ts";
import { map } from "./map.ts";
import { parse } from "./parse.ts";
import { match } from "./text/match.ts";
import { node } from "./node.ts";
import { assertEquals } from "@std/assert";

Deno.test("desc", () => {
  const num = desc(map(match(/[0-9]+/), Number), ["number"]);
  assertEquals(parse(num, "9"), {
    ok: true,
    value: 9,
  });
  assertEquals(parse(num, "x"), {
    expected: ["number"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});

Deno.test("desc with node", () => {
  const num = desc(node(map(match(/[0-9]+/), Number), "Number"), ["number"]);
  assertEquals(parse(num, "9"), {
    ok: true,
    value: {
      name: "Number",
      value: 9,
      start: { index: 0, line: 1, column: 1 },
      end: { index: 1, line: 1, column: 2 },
    },
  });
  assertEquals(parse(num, "x"), {
    expected: ["number"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
