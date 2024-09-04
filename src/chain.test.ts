import { chain } from "./chain.ts";
import { map } from "./map.ts";
import { match } from "./match.ts";
import { skip } from "./skip.ts";
import { wrap } from "./wrap.ts";
import { parseText as parse, type TextParser } from "./text_parser.ts";
import { text as textBase } from "./text.ts";
import { assertEquals } from "@std/assert";

type TextFn = <S extends string>(string: S) => TextParser<S, [S]>;
const text: TextFn = textBase;

Deno.test("chain", () => {
  const a = text("a");
  const b = text("b");
  const ab = chain(a, () => b);
  assertEquals(parse(ab, "ab"), { ok: true, value: "b" });
  assertEquals(parse(ab, "a"), {
    ok: false,
    expected: ["b"],
    location: { index: 1, line: 1, column: 2 },
  });
  assertEquals(parse(ab, "b"), {
    ok: false,
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
  });
  assertEquals(parse(ab, ""), {
    ok: false,
    expected: ["a"],
    location: { index: 0, line: 1, column: 1 },
  });
});

Deno.test("xml tag", () => {
  const openingTag = wrap(text("<"), match(/\w+/), text(">"));
  const closingTag = (tag: string) => wrap(text("</"), text(tag), text(">"));
  const xmlTag = chain(openingTag, (tag) =>
    map(
      skip(match(/[^<]+|/), closingTag(tag)),
      (content) => [tag, content] as const,
    ));
  assertEquals(parse(xmlTag, "<body></body>"), {
    ok: true,
    value: ["body", ""],
  });
  assertEquals(parse(xmlTag, "<meta>data</meta>"), {
    ok: true,
    value: ["meta", "data"],
  });
});
