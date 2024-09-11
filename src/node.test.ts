import { desc } from "./desc.ts";
import { match } from "./match.ts";
import { node } from "./node.ts";
import { parse, type TextReader } from "./text_parser.ts";
import { text } from "./text.ts";
import { assertEquals } from "@std/assert";

Deno.test("node", () => {
  const identifier = desc(node()(match(/[a-z]+/i), "Identifier"), [
    "identifier",
  ]);
  assertEquals(parse(identifier, "abc"), {
    ok: true,
    value: {
      name: "Identifier",
      value: "abc",
      start: { index: 0, line: 1, column: 1 },
      end: { index: 3, line: 1, column: 4 },
    },
  });
  const multiline = node<TextReader>()(text("A\nB\nC"), "ABC");
  assertEquals(parse(multiline, "A\nB\nC"), {
    ok: true,
    value: {
      name: "ABC",
      value: "A\nB\nC",
      start: { index: 0, line: 1, column: 1 },
      end: { index: 5, line: 3, column: 2 },
    },
  });
});

Deno.test("emoji length", () => {
  const smiles = "🙂🙂🙂";
  const result = node<TextReader>()(text(smiles), "Emoji");
  assertEquals(parse(result, smiles), {
    ok: true,
    value: {
      name: "Emoji",
      value: smiles,
      start: { index: 0, line: 1, column: 1 },
      end: { index: 6, line: 1, column: 4 },
    },
  });
});
