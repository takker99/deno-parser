import { chain, location, map, match } from "@takker/parser";
import { type TextReader, tryParse } from "@takker/parser/text-parser";
import { assertEquals } from "@std/assert";

const identifier = chain(
  location<TextReader>(),
  (start) =>
    chain(
      match(/[a-z]+/i),
      (name) =>
        map(
          location<TextReader>(),
          (end) => ({ type: "Identifier", name, start, end }),
        ),
    ),
);
Deno.test("location", () => {
  assertEquals(tryParse(identifier, "abc"), {
    type: "Identifier",
    name: "abc",
    start: { index: 0, line: 1, column: 1 },
    end: { index: 3, line: 1, column: 4 },
  });
});
