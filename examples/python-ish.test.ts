import { assertSnapshot } from "@std/testing/snapshot";
import { Python } from "./python-ish.ts";

Deno.test("py complex", (t) =>
  assertSnapshot(
    t,
    Python.parse(
      `\
block:
  alpha
  bravo
  block:\r
          charlie
          delta\r
          echo
          block:
           foxtrot
  golf\
`,
    ),
  ));

Deno.test("py simple", (t) =>
  assertSnapshot(
    t,
    Python.parse(
      `\
block:
  alpha
  bravo
`,
    ),
  ));

Deno.test("py even simpler", (t) => assertSnapshot(t, Python.parse(`alpha`)));

Deno.test("py bad indent", (t) =>
  assertSnapshot(
    t,
    Python.parse(
      `\
block:
        alpha
        block:
    beta
`,
    ),
  ));
