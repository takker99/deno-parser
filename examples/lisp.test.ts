import { parse } from "../src/parse.ts";
import { Lisp } from "./lisp.ts";
import { assertSnapshot } from "@std/testing/snapshot";

Deno.test("lisp symbol", async (t) => {
  await assertSnapshot(t, parse(Lisp, `a`));
  await assertSnapshot(t, parse(Lisp, `kebab-case-symbol`));
  await assertSnapshot(t, parse(Lisp, `snake_case_symbol`));
  await assertSnapshot(t, parse(Lisp, `camelCaseSymbol`));
  await assertSnapshot(t, parse(Lisp, `a0`));
});

Deno.test("lisp number", async (t) => {
  await assertSnapshot(t, parse(Lisp, `1`));
  await assertSnapshot(t, parse(Lisp, `12`));
  await assertSnapshot(t, parse(Lisp, `345`));
  await assertSnapshot(t, parse(Lisp, `1234567890`));
});

Deno.test("lisp list", async (t) => {
  await assertSnapshot(t, parse(Lisp, `()`));
  await assertSnapshot(t, parse(Lisp, `(1)`));
  await assertSnapshot(t, parse(Lisp, `(1 2)`));
  await assertSnapshot(t, parse(Lisp, `(list 1 2)`));
  await assertSnapshot(t, parse(Lisp, `( list 1 2 )`));
  await assertSnapshot(
    t,
    parse(
      Lisp,
      `
(def inc (x)
  (add x 1))

(print (inc 3))
`,
    ),
  );
});
