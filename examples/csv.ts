import { ok } from "../src/ok.ts";
import { text } from "../src/text.ts";
import { match } from "../src/match.ts";
import type { Parser } from "../src/parse.ts";
import { or } from "../src/or.ts";
import { chain } from "../src/chain.ts";
import { map } from "../src/map.ts";
import { repeat } from "../src/repeat.ts";
import { sepBy } from "../src/sepBy.ts";
import { skip } from "../src/skip.ts";

// CSVs should end with `\r\n` but `\n` is fine too.
const csvEnd = or(text("\r\n"), text("\n"));
// If the string doesn't have any newlines, commas, or `"`, parse it with a
// single regular expression for speed.
const csvFieldSimple = match(/[^\r\n,"]*/);
// - Starts with a double quote `"`.
// - The contains 0+ quoted characters.
// - Quoted characters are either `""` which evaluates to a single `"`.
// - OR they are any other character, including newlines.
const csvFieldQuoted = chain(
  text('"'),
  () =>
    chain(
      map(
        repeat(
          or(
            match(/[^"]+/),
            map(text('""'), () => '"'),
          ),
          0,
        ),
        (chunks) => chunks.join(""),
      ),
      (txt) => map(text('"'), () => txt),
    ),
);
// A field is a single value
const csvField = or(csvFieldQuoted, csvFieldSimple);
// Each row (line) is 1 or more values separated by commas
const csvRow = sepBy(csvField, text(","), 1);
/** A CSV file is _basically_ just 1 or more rows, but our parser accidentally
 * reads the final empty line incorrectly and we have to hack around that.
 */
export const CSV: Parser<string[][]> = map(
  skip(
    sepBy(csvRow, csvEnd, 1),
    or(csvEnd, ok("")),
  ),
  (rows) =>
    rows.filter((row, index) =>
      // Given that CSV files don't require line endings strictly, and empty
      // string is a valid CSV row, we need to make sure and trim off the final
      // row if all it has is a single empty string, since this parser will
      // mistakenly parse that into `[""]` even though you can't end a CSV file
      // with a single empty field (I think).
      !(index === rows.length - 1 && row.length === 1 && row[0] === "")
    ),
);
