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
      ok: false,
      expected: [
        { expected: "\r\n", location: { column: 7, index: 6, line: 1 } },
        { expected: "block:", location: { column: 9, index: 15, line: 2 } },
        { expected: "\r\n", location: { column: 14, index: 20, line: 2 } },
        { expected: "\r\n", location: { column: 15, index: 35, line: 3 } },
        {
          expected: "more than 4 spaces",
          location: { column: 5, index: 40, line: 4 },
        },
        { expected: "\r\n", location: { column: 14, index: 34, line: 3 } },
        { expected: "\n", location: { column: 14, index: 34, line: 3 } },
        { expected: "<EOF>", location: { column: 14, index: 34, line: 3 } },
        { expected: "<EOF>", location: { column: 1, index: 21, line: 3 } },
      ],
    },
  ));
