import { assertEquals } from "@std/assert";
import { or } from "./or.ts";
import { and } from "./and.ts";
import { chain } from "./chain.ts";
import { map } from "./map.ts";
import { textInBytes as text } from "./text.ts";
import { parse } from "./byte_parser.ts";

const encode = (str: string) => new TextEncoder().encode(str);

Deno.test("and", () => {
  const x = text("x");
  const y = text("y");
  const xy = and(x, y);
  assertEquals(parse(xy, encode("xy")), { ok: true, value: ["x", "y"] });
});

Deno.test("and triple", () => {
  const x = text("x");
  const y = text("y");
  const z = text("z");
  const xyz = and(and(x, y), z);
  assertEquals(parse(xyz, encode("xyz")), {
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
  assertEquals(parse(xyz, encode("xyz")), { ok: true, value: ["x", "y", "z"] });
});

Deno.test("and failure", () => {
  const x = text("x");
  const y = text("y");
  const xy = and(x, y);
  assertEquals(parse(xy, encode("x")), {
    ok: false,
    expected: ["y"],
    location: { index: 1 },
  });
  assertEquals(parse(xy, encode("y")), {
    ok: false,
    expected: ["x"],
    location: { index: 0 },
  });
  assertEquals(parse(xy, encode("yx")), {
    ok: false,
    expected: ["x"],
    location: { index: 0 },
  });
  assertEquals(parse(xy, new Uint8Array()), {
    ok: false,
    expected: ["x"],
    location: { index: 0 },
  });
});

Deno.test("or", () => {
  const a = text("a");
  const b = text("b");
  const ab = or(a, b);
  assertEquals(parse(ab, encode("a")), { ok: true, value: "a" });
  assertEquals(parse(ab, encode("b")), { ok: true, value: "b" });
  assertEquals(parse(ab, encode("c")), {
    expected: ["a", "b"],
    location: { index: 0 },
    ok: false,
  });
  assertEquals(parse(ab, encode("ab")), {
    expected: ["<EOF>"],
    location: { index: 1 },
    ok: false,
  });
  assertEquals(parse(ab, new Uint8Array()), {
    expected: ["a", "b"],
    location: { index: 0 },
    ok: false,
  });
});
