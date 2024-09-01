import { assertSnapshot } from "@std/testing/snapshot";
import { Python } from "./python-ish.ts";
import { parse } from "../src/parse.ts";

Deno.test("py complex", (t) =>
  assertSnapshot(
    t,
    parse(
      Python,
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
    parse(
      Python,
      `\
block:
  alpha
  bravo
`,
    ),
  ));

Deno.test("py even simpler", (t) => assertSnapshot(t, parse(Python, `alpha`)));

Deno.test("py bad indent", (t) =>
  assertSnapshot(
    t,
    parse(
      Python,
      `\
block:
        alpha
        block:
    beta
`,
    ),
  ));
