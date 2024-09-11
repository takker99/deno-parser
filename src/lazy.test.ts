import { lazy } from "./lazy.ts";
import { or } from "./or.ts";
import { parse } from "./text_parser.ts";
import { sepBy } from "./sepBy.ts";
import { text } from "./text.ts";
import { wrap } from "./wrap.ts";
import { assertEquals } from "@std/assert";
import type { Parser } from "./parser.ts";

Deno.test("lazy", () => {
  type Expr = Item | List;
  type Item = "x";
  type List = Expr[];
  type ExprExpected = ["x", "("] | ["x", " "] | ["x", ")"] | ["x", ...string[]];
  const expr: Parser<Expr, ExprExpected> = lazy(() => {
    return or(item, list);
  });
  const item = text("x");
  const list = wrap(
    text("("),
    sepBy(expr, text(" "), 0),
    text(")"),
  );

  assertEquals(parse(expr, "(x x (x () (x) ((x)) x) x)"), {
    ok: true,
    value: ["x", "x", ["x", [], ["x"], [["x"]], "x"], "x"],
  });
});
