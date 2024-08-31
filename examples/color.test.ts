import { Color } from "./color.ts";
import { assertEquals, assertThrows } from "@std/assert";

Deno.test("hex color", () => {
  assertEquals(Color.tryParse("#fff"), { r: 255, g: 255, b: 255, a: 1 });
  assertEquals(Color.tryParse("#000000"), { r: 0, g: 0, b: 0, a: 1 });
  assertEquals(Color.tryParse("#729fcf"), { r: 114, g: 159, b: 207, a: 1 });
  assertEquals(Color.tryParse("#888888"), { r: 136, g: 136, b: 136, a: 1 });
  assertEquals(Color.tryParse("#FfFfFf"), { r: 255, g: 255, b: 255, a: 1 });

  assertThrows(() => Color.tryParse("#00aa"));
  assertThrows(() => Color.tryParse("#00aa0"));
  assertThrows(() => Color.tryParse("#abcXYZ"));
});

Deno.test("rgb color", () => {
  assertEquals(Color.tryParse("rgb(47, 0, 0)"), { r: 47, g: 0, b: 0, a: 1 });
  assertEquals(Color.tryParse("rgb(255,0,0)"), { r: 255, g: 0, b: 0, a: 1 });
  assertEquals(Color.tryParse("rgb( 128,1,10 )"), {
    r: 128,
    g: 1,
    b: 10,
    a: 1,
  });
  assertEquals(Color.tryParse("rgb( 47 , 9 , 99 )"), {
    r: 47,
    g: 9,
    b: 99,
    a: 1,
  });

  assertThrows(() => Color.tryParse("rgb( 47 , 9 , 99, 1 )"));
  assertThrows(() => Color.tryParse("rgb( 1 )"));
  assertThrows(() => Color.tryParse("rgb( )"));
});

Deno.test("rgba color", () => {
  assertEquals(Color.tryParse("rgba(47, 0, 0, 1)"), {
    r: 47,
    g: 0,
    b: 0,
    a: 1,
  });
  assertEquals(Color.tryParse("rgba(255,0,0, 0.5)"), {
    r: 255,
    g: 0,
    b: 0,
    a: 0.5,
  });
  assertEquals(Color.tryParse("rgba( 128,1,10, 0 )"), {
    r: 128,
    g: 1,
    b: 10,
    a: 0,
  });
  assertEquals(Color.tryParse("rgba( 47 , 9 , 99, 0.05 )"), {
    r: 47,
    g: 9,
    b: 99,
    a: 0.05,
  });
  assertThrows(() => Color.tryParse("rgba( 1, 2, 3 )"));
  assertThrows(() => Color.tryParse("rgba( 1 2 3 )"));
  assertThrows(() => Color.tryParse("rgba( 0 )"));
  assertThrows(() => Color.tryParse("rgba( )"));
});
