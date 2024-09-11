import { text } from "./text.ts";
import { assertEquals } from "@std/assert";
import { parse } from "./text_parser.ts";

Deno.test("test a test", () => {
  const x = text("x");
  assertEquals(parse(x, "x"), { ok: true, value: "x" });
});

Deno.test("text", () => {
  const items = ["", "abc", "🙂", "1\n2\n3"];
  for (const str of items) {
    assertEquals(parse(text(str), str), { ok: true, value: str });
  }
});
