import { Lisp } from "./lisp.ts";
import { assertSnapshot } from "@std/testing/snapshot";

Deno.test("lisp symbol", async (t) => {
  await assertSnapshot(t, Lisp.parse(`a`));
  await assertSnapshot(t, Lisp.parse(`kebab-case-symbol`));
  await assertSnapshot(t, Lisp.parse(`snake_case_symbol`));
  await assertSnapshot(t, Lisp.parse(`camelCaseSymbol`));
  await assertSnapshot(t, Lisp.parse(`a0`));
});

Deno.test("lisp number", async (t) => {
  await assertSnapshot(t, Lisp.parse(`1`));
  await assertSnapshot(t, Lisp.parse(`12`));
  await assertSnapshot(t, Lisp.parse(`345`));
  await assertSnapshot(t, Lisp.parse(`1234567890`));
});

Deno.test("lisp list", async (t) => {
  await assertSnapshot(t, Lisp.parse(`()`));
  await assertSnapshot(t, Lisp.parse(`(1)`));
  await assertSnapshot(t, Lisp.parse(`(1 2)`));
  await assertSnapshot(t, Lisp.parse(`(list 1 2)`));
  await assertSnapshot(t, Lisp.parse(`( list 1 2 )`));
  await assertSnapshot(
    t,
    Lisp.parse(
      `
(def inc (x)
  (add x 1))

(print (inc 3))
`,
    ),
  );
});
