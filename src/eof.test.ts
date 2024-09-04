import { eof } from "./eof.ts";
import { parseText as parse } from "./text_parser.ts";
import { assertEquals } from "@std/assert/equals";

Deno.test("matchEOF", () => {
  assertEquals(parse(eof, ""), { ok: true, value: "<EOF>" });
  assertEquals(parse(eof, "x"), {
    expected: ["<EOF>"],
    location: { index: 0, line: 1, column: 1 },
    ok: false,
  });
});
