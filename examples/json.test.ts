import { assertEquals } from "@std/assert";
import { parse } from "../src/text_parser.ts";
import { JSON } from "./json.ts";

Deno.test("json complex", () =>
  assertEquals(
    parse(
      JSON,
      `\
{
  "id": "a thing\\nice\tab",
  "another property!"
    : "also cool"
  , "weird formatting is ok too........😂": 123.45e1,
  "": [
    true, false, null,
    "",
    " ",
    {},
    {"": {}}
  ]
}
`,
    ),
    {
      ok: true,
      value: {
        // deno-fmt-ignore
        "": [ true, false, null, "", " ", {}, { "": {}, }, ],
        "another property!": "also cool",
        "weird formatting is ok too........😂": 1234.5,
        id: `a thing
ice\tab`,
      },
    },
  ));

Deno.test("json simple", () =>
  assertEquals(
    parse(JSON, `{"array":[1,"two",null,true,false],"obj":{}}`),
    {
      ok: true,
      value: {
        array: [1, "two", null, true, false],
        obj: {},
      },
    },
  ));

Deno.test("json multiline", () =>
  assertEquals(
    parse(
      JSON,
      `
{
  "array": [1, "two", null, true, false]
  "obj": {}
}
`,
    ),
    {
      expected: [",", "}"],
      location: { column: 3, index: 46, line: 4 },
      ok: false,
    },
  ));

Deno.test("json multiline extra weird", () =>
  assertEquals(
    parse(
      JSON,
      `
{
  "array" : [ 1 , "two", null , true , false ] ,
  "obj" : {


        "key"       : "value"


  }
}
`,
    ),
    {
      ok: true,
      value: {
        array: [1, "two", null, true, false],
        obj: { key: "value" },
      },
    },
  ));

Deno.test("json unicode escape", () =>
  assertEquals(parse(JSON, `{ "space": "\\u0020" }`), {
    ok: true,
    value: { space: " " },
  }));

Deno.test("json named escape", () =>
  assertEquals(parse(JSON, `{ "bnfrt": "\\b\\n\\f\\r\\t" }`), {
    ok: true,
    value: {
      bnfrt: `
\r	`,
    },
  }));

Deno.test("json useless escape", () =>
  assertEquals(parse(JSON, `{ "xyz": "\\x\\y\\z" }`), {
    ok: true,
    value: { xyz: "xyz" },
  }));
