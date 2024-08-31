import { match, ok, type Parser, text } from "../mod.ts";

// CSVs should end with `\r\n` but `\n` is fine too.
const csvEnd = text("\r\n").or(text("\n"));
// If the string doesn't have any newlines, commas, or `"`, parse it with a
// single regular expression for speed.
const csvFieldSimple = match(/[^\r\n,"]*/);
// - Starts with a double quote `"`.
// - The contains 0+ quoted characters.
// - Quoted characters are either `""` which evaluates to a single `"`.
// - OR they are any other character, including newlines.
const csvFieldQuoted = text('"').chain(() => {
  return match(/[^"]+/)
    .or(text('""').map(() => '"'))
    .repeat(0)
    .map((chunks) => chunks.join(""))
    .chain((txt) => text('"').map(() => txt));
});
// A field is a single value
const csvField = csvFieldQuoted.or(csvFieldSimple);
// Each row (line) is 1 or more values separated by commas
const csvRow = csvField.sepBy(text(","), 1);
/** A CSV file is _basically_ just 1 or more rows, but our parser accidentally
 * reads the final empty line incorrectly and we have to hack around that.
 */
export const CSV: Parser<string[][]> = csvRow
  .sepBy(csvEnd, 1)
  .skip(csvEnd.or(ok("")))
  .map((rows) => {
    return rows.filter((row, index) => {
      // Given that CSV files don't require line endings strictly, and empty
      // string is a valid CSV row, we need to make sure and trim off the final
      // row if all it has is a single empty string, since this parser will
      // mistakenly parse that into `[""]` even though you can't end a CSV file
      // with a single empty field (I think).
      return !(index === rows.length - 1 && row.length === 1 && row[0] === "");
    });
  });
