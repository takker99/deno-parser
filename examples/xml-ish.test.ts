import { XML } from "./xml-ish.ts";
import { assertEquals } from "@std/assert";
import { parse, tryParse } from "../src/text_parser.ts";

Deno.test("xml basic", () => {
  assertEquals(tryParse(XML, `<a key="val" />`), {
    name: "a",
    attributes: { key: "val" },
    children: [],
  });
  assertEquals(tryParse(XML, `<a key="val">foo<b /></a>`), {
    name: "a",
    attributes: { key: "val" },
    children: ["foo", { name: "b", attributes: {}, children: [] }],
  });
});

Deno.test("xml large example", () =>
  assertEquals(
    parse(
      XML,
      `
    <Map>
      <Entry key="string-a"><String>alpha</String></Entry>
      <Entry key="string-b"><String>bravo</String></Entry>
      <Entry key="string-c"><String>charlie</String></Entry>
      <Entry key="list">
        <List>
          <String>a</String>
          <String>b</String>
          <String>c</String>
        </List>
      </Entry>
      <Entry key="null"><Null /></Entry>
      <Entry key="empty" />
    </Map>
    `,
    ),
    {
      ok: true,
      value: {
        attributes: {},
        children: [
          `
      `,
          {
            attributes: {
              key: "string-a",
            },
            children: [
              {
                attributes: {},
                children: [
                  "alpha",
                ],
                name: "String",
              },
            ],
            name: "Entry",
          },
          {
            attributes: {
              key: "string-b",
            },
            children: [
              {
                attributes: {},
                children: [
                  "bravo",
                ],
                name: "String",
              },
            ],
            name: "Entry",
          },
          {
            attributes: {
              key: "string-c",
            },
            children: [
              {
                attributes: {},
                children: [
                  "charlie",
                ],
                name: "String",
              },
            ],
            name: "Entry",
          },
          {
            attributes: {
              key: "list",
            },
            children: [
              `
        `,
              {
                attributes: {},
                children: [
                  `
          `,
                  {
                    attributes: {},
                    children: [
                      "a",
                    ],
                    name: "String",
                  },
                  {
                    attributes: {},
                    children: [
                      "b",
                    ],
                    name: "String",
                  },
                  {
                    attributes: {},
                    children: [
                      "c",
                    ],
                    name: "String",
                  },
                ],
                name: "List",
              },
            ],
            name: "Entry",
          },
          {
            attributes: {
              key: "null",
            },
            children: [
              {
                attributes: {},
                children: [],
                name: "Null",
              },
            ],
            name: "Entry",
          },
          {
            attributes: {
              key: "empty",
            },
            children: [],
            name: "Entry",
          },
        ],
        name: "Map",
      },
    },
  ));
