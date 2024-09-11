import { assertEquals } from "@std/assert";
import { Python } from "./python-ish.ts";
import { parse } from "../src/text_parser.ts";

Deno.test("py complex", () =>
  assertEquals(
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
    {
      ok: true,
      value: {
        type: "Block",
        statements: [
          { type: "Ident", value: "alpha" },
          { type: "Ident", value: "bravo" },
          {
            type: "Block",
            statements: [
              { type: "Ident", value: "charlie" },
              { type: "Ident", value: "delta" },
              { type: "Ident", value: "echo" },
              {
                type: "Block",
                statements: [
                  { type: "Ident", value: "foxtrot" },
                ],
              },
            ],
          },
          { type: "Ident", value: "golf" },
        ],
      },
    },
  ));

Deno.test("py simple", () =>
  assertEquals(
    parse(
      Python,
      `\
block:
  alpha
  bravo
`,
    ),
    {
      ok: true,
      value: {
        type: "Block",
        statements: [
          { type: "Ident", value: "alpha" },
          { type: "Ident", value: "bravo" },
        ],
      },
    },
  ));

Deno.test("py even simpler", () =>
  assertEquals(parse(Python, `alpha`), {
    ok: true,
    value: { type: "Ident", value: "alpha" },
  }));

Deno.test("py bad indent", () =>
  assertEquals(
    parse(
      Python,
      `\
block:
        alpha
        block:
    beta
`,
    ),
    {
      expected: ["more than 4 spaces"],
      location: { column: 5, index: 40, line: 4 },
      ok: false,
    },
  ));
