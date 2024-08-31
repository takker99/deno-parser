import { XML } from "./xml-ish.ts";
import { assertSnapshot } from "@std/testing/snapshot";
import { assertEquals } from "@std/assert";

Deno.test("xml basic", () => {
  assertEquals(XML.tryParse(`<a key="val" />`), {
    name: "a",
    attributes: { key: "val" },
    children: [],
  });
  assertEquals(XML.tryParse(`<a key="val">foo<b /></a>`), {
    name: "a",
    attributes: { key: "val" },
    children: ["foo", { name: "b", attributes: {}, children: [] }],
  });
});

Deno.test("xml large example", (t) =>
  assertSnapshot(
    t,
    XML.parse(
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
  ));
