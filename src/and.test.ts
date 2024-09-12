import { assertEquals } from "@std/assert";
import { and } from "./and.ts";
import { chain } from "./chain.ts";
import { map } from "./map.ts";
import { text } from "./text.ts";
import { parse } from "./text_parser.ts";

Deno.test("and", () => {
  const x = text("x");
  const y = text("y");
  const xy = and(x, y);
  assertEquals(parse(xy, "xy"), { ok: true, value: ["x", "y"] });
});

Deno.test("and triple", () => {
  const x = text("x");
  const y = text("y");
  const z = text("z");
  const xyz = and(and(x, y), z);
  assertEquals(parse(xyz, "xyz"), {
    ok: true,
    value: [["x", "y"], "z"],
  });
});

Deno.test("and success triple 2", () => {
  const x = text("x");
  const y = text("y");
  const z = text("z");
  const xyz = chain(and(x, y), ([x, y]) => {
    return map(z, (z) => {
      return [x, y, z] as const;
    });
  });
  assertEquals(parse(xyz, "xyz"), { ok: true, value: ["x", "y", "z"] });
});

Deno.test("and failure", () => {
  const x = text("x");
  const y = text("y");
  const xy = and(x, y);
  assertEquals(parse(xy, "x"), {
    ok: false,
    expected: [{ expected: ["y"], location: { index: 1, line: 1, column: 2 } }],
  });
  assertEquals(parse(xy, "y"), {
    ok: false,
    expected: [{ expected: ["x"], location: { index: 0, line: 1, column: 1 } }],
  });
  assertEquals(parse(xy, "yx"), {
    ok: false,
    expected: [{ expected: ["x"], location: { index: 0, line: 1, column: 1 } }],
  });
  assertEquals(parse(xy, ""), {
    ok: false,
    expected: [{ expected: ["x"], location: { index: 0, line: 1, column: 1 } }],
  });
});
