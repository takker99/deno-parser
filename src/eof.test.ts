import { eof } from "./eof.ts";
import { assertEquals } from "@std/assert/equals";
import { parse } from "./text_parser.ts";

Deno.test("matchEOF", () => {
  assertEquals(parse(eof, ""), { ok: true, value: "<EOF>" });
  assertEquals(parse(eof, "x"), {
    ok: false,
    expected: [{
      expected: "<EOF>",
      location: { index: 0, line: 1, column: 1 },
    }],
  });
});
