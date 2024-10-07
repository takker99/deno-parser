import { parse } from "../src/text_parser.ts";
import { CSV } from "./csv.ts";
import { assertEquals } from "@std/assert";

Deno.test("csv simple", () =>
  assertEquals(
    parse(
      CSV,
      `\
apple,1.23,1312
banana,0.99,67
cherry,0.54,987
dragonfruit,2.87,4
elderberry,9.99,22
`,
    ),
    {
      ok: true,
      value: [
        ["apple", "1.23", "1312"],
        ["banana", "0.99", "67"],
        ["cherry", "0.54", "987"],
        ["dragonfruit", "2.87", "4"],
        ["elderberry", "9.99", "22"],
      ],
    },
  ));

Deno.test("csv complex", () =>
  assertEquals(
    parse(
      CSV,
      `\
a,,c,"a ""complex"" field, i think"
d,eeeeee,FFFF,cool
nice,nice,nice3,nice4
`,
    ),
    {
      ok: true,
      value: [
        ["a", "", "c", 'a "complex" field, i think'],
        ["d", "eeeeee", "FFFF", "cool"],
        ["nice", "nice", "nice3", "nice4"],
      ],
    },
  ));

Deno.test("csv LF", () =>
  assertEquals(
    parse(
      CSV,
      `\
a,b,c\n\
a,b,c\n\
a,b,c\
`,
    ),
    {
      ok: true,
      value: [
        ["a", "b", "c"],
        ["a", "b", "c"],
        ["a", "b", "c"],
      ],
    },
  ));

Deno.test("csv CRLF", () =>
  assertEquals(
    parse(
      CSV,
      `\
a,b,c\r\n\
a,b,c\r\n\
a,b,c\
`,
    ),
    {
      ok: true,
      value: [
        ["a", "b", "c"],
        ["a", "b", "c"],
        ["a", "b", "c"],
      ],
    },
  ));

Deno.test("csv trailing newline", () => {
  assertEquals(
    parse(
      CSV,
      `\
a,b,c\r\n\
a,b,c\r\n\
a,b,c\r\n\
`,
    ),
    {
      ok: true,
      value: [
        ["a", "b", "c"],
        ["a", "b", "c"],
        ["a", "b", "c"],
      ],
    },
  );
  assertEquals(
    parse(
      CSV,
      `\
a,b,c\n\
a,b,c\n\
a,b,c\n\
`,
    ),
    {
      ok: true,
      value: [
        ["a", "b", "c"],
        ["a", "b", "c"],
        ["a", "b", "c"],
      ],
    },
  );
});
