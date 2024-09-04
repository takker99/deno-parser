import { lazy } from "./lazy.ts";
import { or } from "./or.ts";
import { parseText as parse, type TextParser } from "./text_parser.ts";
import { sepBy } from "./sepBy.ts";
import { text } from "./text.ts";
import { wrap } from "./wrap.ts";
import { assertEquals } from "@std/assert";

Deno.test("lazy", () => {
  type Expr = Item | List;
  type Item = "x";
  type List = Expr[];
  const expr: TextParser<Expr> = lazy(() => {
    return or(item, list);
  });
  const item: TextParser<"x", ["x"]> = text("x");
  const list = wrap(
    text("(") as TextParser<"(", ["("]>,
    sepBy(expr, text(" "), 0),
    text(")"),
  );

  assertEquals(parse(expr, "(x x (x () (x) ((x)) x) x)"), {
    ok: true,
    value: ["x", "x", ["x", [], ["x"], [["x"]], "x"], "x"],
  });
});
