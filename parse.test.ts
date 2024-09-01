import { assertEquals, assertThrows } from "@std/assert";
import { parse, tryParse } from "./parse.ts";
import { text } from "./text.ts";
import { match } from "./match.ts";
import { next } from "./next.ts";
import { sepBy } from "./sepBy.ts";
import { skip } from "./skip.ts";

Deno.test("tryParse", () => {
  const a = text("a");
  assertEquals(tryParse(a, "a"), "a");
  assertThrows(() => tryParse(a, "b"));
});

Deno.test("lisp lists", () => {
  const symbol = match(/[a-zA-Z_-]+/);
  const lp = text("(");
  const rp = text(")");
  const ws = match(/\s+/);
  const list = skip(next(lp, sepBy(symbol, ws, 0)), rp);

  assertEquals(parse(list, "(a b c)"), {
    ok: true,
    value: ["a", "b", "c"],
  });
});
