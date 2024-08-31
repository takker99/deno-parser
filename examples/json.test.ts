import { JSON } from "./json.ts";
import { assertSnapshot } from "@std/testing/snapshot";

Deno.test("json complex", (t) =>
  assertSnapshot(
    t,
    JSON.parse(
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
    JSON.parse(`{"array":[1,"two",null,true,false],"obj":{}}`),
  ));

Deno.test("json multiline", (t) =>
  assertSnapshot(
    t,
    JSON.parse(
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
    JSON.parse(
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
  assertSnapshot(t, JSON.parse(`{ "space": "\\u0020" }`)));

Deno.test("json named escape", (t) =>
  assertSnapshot(t, JSON.parse(`{ "bnfrt": "\\b\\n\\f\\r\\t" }`)));

Deno.test("json useless escape", (t) =>
  assertSnapshot(t, JSON.parse(`{ "xyz": "\\x\\y\\z" }`)));
