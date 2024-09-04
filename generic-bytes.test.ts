import { assertEquals } from "@std/assert";
import {
  and,
  type ByteParser,
  chain,
  map,
  or,
  parseBytes as parse,
} from "@takker/parser";
import { textBytes } from "./src/text_bytes.ts";

type TextFn = <S extends string>(string: S) => ByteParser<S, [S]>;
const text = textBytes as TextFn;

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
    location: 1,
  });
  assertEquals(parse(xy, encode("y")), {
    ok: false,
    expected: ["x"],
    location: 0,
  });
  assertEquals(parse(xy, encode("yx")), {
    ok: false,
    expected: ["x"],
    location: 0,
  });
  assertEquals(parse(xy, new Uint8Array()), {
    ok: false,
    expected: ["x"],
    location: 0,
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
    location: 0,
    ok: false,
  });
  assertEquals(parse(ab, encode("ab")), {
    expected: ["<EOF>"],
    location: 1,
    ok: false,
  });
  assertEquals(parse(ab, new Uint8Array()), {
    expected: ["a", "b"],
    location: 0,
    ok: false,
  });
});
