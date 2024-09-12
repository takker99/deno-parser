import { desc } from "./desc.ts";
import { map } from "./map.ts";
import { match } from "./match.ts";
import { node } from "./node.ts";
import { parse, type TextReader } from "./text_parser.ts";
import { assertEquals } from "@std/assert";

Deno.test("desc", () => {
  const num = desc(map(match(/[0-9]+/), Number), ["number"]);
  assertEquals(parse(num, "9"), {
    ok: true,
    value: 9,
  });
  assertEquals(parse(num, "x"), {
    ok: false,
    expected: [{
      expected: "number",
      location: { index: 0, line: 1, column: 1 },
    }],
  });
});

Deno.test("desc with node", () => {
  const num = desc(node<TextReader>()(map(match(/[0-9]+/), Number), "Number"), [
    "number",
  ]);
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
    ok: false,
    expected: [{
      expected: "number",
      location: { index: 0, line: 1, column: 1 },
    }],
  });
});
