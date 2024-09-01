import { Color } from "./color.ts";
import { tryParse } from "../parse.ts";
import { assertEquals, assertThrows } from "@std/assert";

Deno.test("hex color", () => {
  assertEquals(tryParse(Color, "#fff"), { r: 255, g: 255, b: 255, a: 1 });
  assertEquals(tryParse(Color, "#000000"), { r: 0, g: 0, b: 0, a: 1 });
  assertEquals(tryParse(Color, "#729fcf"), { r: 114, g: 159, b: 207, a: 1 });
  assertEquals(tryParse(Color, "#888888"), { r: 136, g: 136, b: 136, a: 1 });
  assertEquals(tryParse(Color, "#FfFfFf"), { r: 255, g: 255, b: 255, a: 1 });

  assertThrows(() => tryParse(Color, "#00aa"));
  assertThrows(() => tryParse(Color, "#00aa0"));
  assertThrows(() => tryParse(Color, "#abcXYZ"));
});

Deno.test("rgb color", () => {
  assertEquals(tryParse(Color, "rgb(47, 0, 0)"), { r: 47, g: 0, b: 0, a: 1 });
  assertEquals(tryParse(Color, "rgb(255,0,0)"), { r: 255, g: 0, b: 0, a: 1 });
  // deno-fmt-ignore
  assertEquals(tryParse(Color, "rgb( 128,1,10 )"), { r: 128, g: 1, b: 10, a: 1, });
  // deno-fmt-ignore
  assertEquals(tryParse(Color, "rgb( 47 , 9 , 99 )"), { r: 47, g: 9, b: 99, a: 1, });

  assertThrows(() => tryParse(Color, "rgb( 47 , 9 , 99, 1 )"));
  assertThrows(() => tryParse(Color, "rgb( 1 )"));
  assertThrows(() => tryParse(Color, "rgb( )"));
});

Deno.test("rgba color", () => {
  // deno-fmt-ignore
  assertEquals(tryParse(Color, "rgba(47, 0, 0, 1)"), { r: 47, g: 0, b: 0, a: 1, });
  // deno-fmt-ignore
  assertEquals(tryParse(Color, "rgba(255,0,0, 0.5)"), { r: 255, g: 0, b: 0, a: 0.5, });
  // deno-fmt-ignore
  assertEquals(tryParse(Color, "rgba( 128,1,10, 0 )"), { r: 128, g: 1, b: 10, a: 0, });
  // deno-fmt-ignore
  assertEquals(tryParse(Color, "rgba( 47 , 9 , 99, 0.05 )"), { r: 47, g: 9, b: 99, a: 0.05, });
  assertThrows(() => tryParse(Color, "rgba( 1, 2, 3 )"));
  assertThrows(() => tryParse(Color, "rgba( 1 2 3 )"));
  assertThrows(() => tryParse(Color, "rgba( 0 )"));
  assertThrows(() => tryParse(Color, "rgba( )"));
});
