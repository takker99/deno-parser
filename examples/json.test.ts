import { parse } from "../src/parse.ts";
import { JSON } from "./json.ts";
import { assertSnapshot } from "@std/testing/snapshot";

Deno.test("json complex", (t) =>
  assertSnapshot(
    t,
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
  ));

Deno.test("json simple", (t) =>
  assertSnapshot(
    t,
    parse(JSON, `{"array":[1,"two",null,true,false],"obj":{}}`),
  ));

Deno.test("json multiline", (t) =>
  assertSnapshot(
    t,
    parse(
      JSON,
      `
{
  "array": [1, "two", null, true, false]
  "obj": {}
}
`,
    ),
  ));

Deno.test("json multiline extra weird", (t) =>
  assertSnapshot(
    t,
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
  ));

Deno.test("json unicode escape", (t) =>
  assertSnapshot(t, parse(JSON, `{ "space": "\\u0020" }`)));

Deno.test("json named escape", (t) =>
  assertSnapshot(t, parse(JSON, `{ "bnfrt": "\\b\\n\\f\\r\\t" }`)));

Deno.test("json useless escape", (t) =>
  assertSnapshot(t, parse(JSON, `{ "xyz": "\\x\\y\\z" }`)));
