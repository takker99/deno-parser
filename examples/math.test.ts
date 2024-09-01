import { assertEquals, assertThrows } from "@std/assert";
import {
  type MathExpr,
  MathOperator1,
  MathOperator2,
  SimpleMath,
} from "./math.ts";
import { assertSnapshot } from "@std/testing/snapshot";
import { parse, tryParse } from "../src/parse.ts";

Deno.test("2 part expression", async (t) => {
  const text = `2 * 3 + 4`;
  const expr = tryParse(SimpleMath, text);
  await assertSnapshot(t, parse(SimpleMath, text));
  assertEquals(expr.calculate(), 10);
  assertEquals(`${expr}`, `((2 * 3) + 4)`);
});

Deno.test("2 part expression with parentheses", async (t) => {
  const text = `2 * (3 + 4)`;
  const expr = tryParse(SimpleMath, text);
  await assertSnapshot(t, parse(SimpleMath, text));
  assertEquals(expr.calculate(), 14);
  assertEquals(`${expr}`, `(2 * (3 + 4))`);
});

Deno.test("unary and binary minus", async (t) => {
  const text = `-1 - -1`;
  const expr = tryParse(SimpleMath, text);
  await assertSnapshot(t, parse(SimpleMath, text));
  assertEquals(expr.calculate(), 0);
  assertEquals(`${expr}`, `((- 1) - (- 1))`);
});

Deno.test("large expression", async (t) => {
  const text = `-2 + 3 * 4 - 5 / 7 ** 6`;
  const expr = tryParse(SimpleMath, text);
  await assertSnapshot(t, parse(SimpleMath, text));
  assertEquals(expr.calculate(), 9.999957500701239);
});

Deno.test("MathOperator1", () => {
  const expr: MathExpr = {
    calculate() {
      return 0;
    },
  };
  assertThrows(() => new MathOperator1("bad", expr).calculate());
});

Deno.test("MathOperator2", () => {
  const expr: MathExpr = {
    calculate() {
      return 0;
    },
  };
  assertThrows(() => new MathOperator2("bad", expr, expr).calculate());
});
