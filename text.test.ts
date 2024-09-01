import { assertEquals } from "@std/assert";
import { parse, tryParse } from "./parse.ts";
import { text } from "./text.ts";

Deno.test("test a test", () => {
  const x = text("x");
  assertEquals(parse(x, "x"), { ok: true, value: "x" });
});

Deno.test("text", () => {
  const items = ["", "abc", "🙂", "1\n2\n3"];
  for (const str of items) {
    assertEquals(tryParse(text(str), str), str);
  }
});
