import { sepBy } from "../src/sepBy.ts";
import { trim } from "../src/trim.ts";
import { desc } from "../src/desc.ts";
import { map } from "../src/map.ts";
import { next } from "../src/next.ts";
import { and } from "../src/and.ts";
import { text } from "../src/text.ts";
import { match } from "../src/match.ts";
import { all } from "../src/all.ts";
import { choice } from "../src/choice.ts";
import type { Parser } from "../src/parse.ts";
import { wrap } from "../src/wrap.ts";

function rgba(r: number, g: number, b: number, a: number) {
  return { r, g, b, a };
}

// Primitives
const ws = desc(match(/\s*/), ["whitespace"]);
const sharp = text("#");
const hexDigit = desc(match(/[0-9a-fA-F]/), ["a hex digit"]);
const hex1 = map(hexDigit, (d) => parseInt(d + d, 16));
const hex2 = map(and(hexDigit, hexDigit), ([d1, d2]) => parseInt(d1 + d2, 16));
const number = desc(map(match(/[0-9]+(\.[0-9]*)?/), Number), ["a number"]);

// Color types
const hexColorShort = map(
  next(sharp, all(hex1, hex1, hex1)),
  ([r, g, b]) => rgba(r, g, b, 1),
);

const hexColorLong = map(
  next(sharp, all(hex2, hex2, hex2)),
  ([r, g, b]) => rgba(r, g, b, 1),
);

const rgbColor = map(
  wrap(
    text("rgb("),
    trim(sepBy(trim(number, ws), text(","), 3, 3), ws),
    text(")"),
  ),
  ([r, g, b]) => rgba(r, g, b, 1),
);

const rgbaColor = map(
  wrap(
    text("rgba("),
    trim(sepBy(trim(number, ws), text(","), 4, 4), ws),
    text(")"),
  ),
  ([r, g, b, a]) => rgba(r, g, b, a),
);

/**
 * Note that {@linkcode hexColorLong} must be placed before {@linkcode hexColorShort}. {@linkcode choice}
 * picks the first parser that matches, and {@linkcode Parser.parse} and {@linkcode Parser.tryParse} error if
 * your parser does not consume the entire input. If you put {@linkcode hexColorShort}
 * first then the last 3 hex digits would be left over at the end when parsing a
 * 6-digit hex color, causing an error.
 */
export const Color: Parser<{
  r: number;
  g: number;
  b: number;
  a: number;
}> = choice(hexColorLong, hexColorShort, rgbColor, rgbaColor);
