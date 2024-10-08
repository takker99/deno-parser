import { parse } from "../src/parse.ts";
import { CSV } from "./csv.ts";
import { assertSnapshot } from "@std/testing/snapshot";

Deno.test("csv simple", (t) =>
  assertSnapshot(
    t,
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
  ));

Deno.test("csv complex", (t) =>
  assertSnapshot(
    t,
    parse(
      CSV,
      `\
a,,c,"a ""complex"" field, i think"
d,eeeeee,FFFF,cool
nice,nice,nice3,nice4
`,
    ),
  ));

Deno.test("csv LF", (t) =>
  assertSnapshot(
    t,
    parse(
      CSV,
      `\
a,b,c\n\
a,b,c\n\
a,b,c\
`,
    ),
  ));

Deno.test("csv CRLF", (t) =>
  assertSnapshot(
    t,
    parse(
      CSV,
      `\
a,b,c\r\n\
a,b,c\r\n\
a,b,c\
`,
    ),
  ));

Deno.test("csv trailing newline", async (t) => {
  await assertSnapshot(
    t,
    parse(
      CSV,
      `\
a,b,c\r\n\
a,b,c\r\n\
a,b,c\r\n\
`,
    ),
  );
  await assertSnapshot(
    t,
    parse(
      CSV,
      `\
a,b,c\n\
a,b,c\n\
a,b,c\n\
`,
    ),
  );
});
