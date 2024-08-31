import { all, choice, match, type Parser, text } from "../mod.ts";

function rgba(r: number, g: number, b: number, a: number) {
  return { r, g, b, a };
}

// Primitives
const ws = match(/\s*/).desc(["whitespace"]);
const sharp = text("#");
const hexDigit = match(/[0-9a-fA-F]/).desc(["a hex digit"]);
const hex1 = hexDigit.map((d) => parseInt(d + d, 16));
const hex2 = hexDigit.and(hexDigit).map(([d1, d2]) => parseInt(d1 + d2, 16));
const number = match(/[0-9]+(\.[0-9]*)?/)
  .map(Number)
  .desc(["a number"]);

// Color types
const hexColorShort = sharp
  .next(all(hex1, hex1, hex1))
  .map(([r, g, b]) => rgba(r, g, b, 1));

const hexColorLong = sharp
  .next(all(hex2, hex2, hex2))
  .map(([r, g, b]) => rgba(r, g, b, 1));

const rgbColor = text("rgb(")
  .next(number.trim(ws).sepBy(text(","), 3, 3).trim(ws))
  .skip(text(")"))
  .map(([r, g, b]) => rgba(r, g, b, 1));

const rgbaColor = text("rgba(")
  .next(number.trim(ws).sepBy(text(","), 4, 4).trim(ws))
  .skip(text(")"))
  .map(([r, g, b, a]) => rgba(r, g, b, a));

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
