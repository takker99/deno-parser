import { ok } from "../src/ok.ts";
import { text } from "../src/text.ts";
import { match } from "../src/match.ts";
import { all } from "../src/all.ts";
import { choice } from "../src/choice.ts";
import { lazy } from "../src/lazy.ts";
import type { Parser } from "../src/parser.ts";
import { trim } from "../src/trim.ts";
import { map } from "../src/map.ts";
import { desc } from "../src/desc.ts";
import { or } from "../src/or.ts";
import { repeat } from "../src/repeat.ts";
import { sepBy } from "../src/sepBy.ts";
import { wrap } from "../src/wrap.ts";
import { and } from "../src/and.ts";
import { chain } from "../src/chain.ts";

// Use the JSON standard's definition of whitespace rather than Parsimmon's.
const whitespace = desc(match(/\s*/m), ["ws"]);

// JSON is pretty relaxed about whitespace, so let's make it easy to ignore
// after most text.
const token = <A>(parser: Parser<A>) => trim(parser, whitespace);

// Several parsers are just strings with optional whitespace.
const word = <S extends string>(str: S) => token(text(str));

/** Represents a JSON value. */
export type JSONValue =
  | { [key: string]: JSONValue }
  | JSONValue[]
  | string
  | number
  | null
  | true
  | false;

/** This is the main entry point of the parser: a full JSON value. */
export const JSON: Parser<JSONValue> = lazy(() =>
  token(choice(
    jsonObject,
    jsonArray,
    jsonString,
    jsonNumber,
    jsonNull,
    jsonTrue,
    jsonFalse,
  ))
);

// The basic tokens in JSON, with optional whitespace afterward.
const jsonLBrace = word("{");
const jsonRBrace = word("}");
const jsonLCurly = word("[");
const jsonRCurly = word("]");
const jsonComma = word(",");
const jsonColon = word(":");
const jsonNull = map(word("null"), () => null);
const jsonTrue = map(word("true"), () => true as const);
const jsonFalse = map(word("false"), () => false as const);

// A string escape sequence
const strEscape = choice(
  map(
    match(/\\u[0-9a-fA-F]{4}/),
    (str) => String.fromCharCode(parseInt(str.slice(2), 16)),
  ),
  map(text("\\b"), () => "\b"),
  map(text("\\n"), () => "\n"),
  map(text("\\f"), () => "\f"),
  map(text("\\r"), () => "\r"),
  map(text("\\t"), () => "\t"),
  map(match(/\\./), (str) => str.slice(1)),
);

// One or more characters that aren't `"` or `\`
const strChunk = match(/[^"\\]+/);

const strPart = or(strEscape, strChunk);

const jsonString = desc(
  token(
    trim(
      map(
        repeat(strPart, 0),
        (parts) => parts.join(""),
      ),
      text('"'),
    ),
  ),
  ["string"],
);

const numSign = or(text("-"), text(""));
const numInt = or(match(/[1-9][0-9]*/), text("0"));
const numFrac = or(match(/\.[0-9]+/), text(""));
const numExp = or(match(/e[+-]?[0-9]+/i), ok(""));

/** You could write this as one giant regular expression, but breaking it up
 * makes it easier to read, write, and test
 *
 * ```ts
 * /-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][+-]?[0-9]+)?/
 * ```
 */
const jsonNumber = desc(
  token(
    map(
      all(numSign, numInt, numFrac, numExp),
      ([sign, integer, fractional, exp]) =>
        // Seeing as JSON numbers are a subset of JS numbers, we can cheat by
        // passing the whole thing off to the `Number` function, so we don't
        // have to evaluate the number ourselves
        Number(sign + integer + fractional + exp),
    ),
  ),
  ["number"],
);

// Array parsing is ignoring brackets and commas and parsing as many nested JSON
// documents as possible. Notice that we're using the parser `JSON` we just
// defined above. Arrays and objects in the JSON grammar are recursive because
// they can contain any other JSON document within them.
const jsonArray = wrap(jsonLCurly, sepBy(JSON, jsonComma, 0), jsonRCurly);

// Object parsing is a little trickier because we have to collect all the key-
// value pairs in order as length-2 arrays, then manually copy them into an
// object.
const objPair = and(jsonString, chain(jsonColon, () => JSON));

const jsonObject = map(
  wrap(jsonLBrace, sepBy(objPair, jsonComma, 0), jsonRBrace),
  (pairs) => {
    const obj: { [key: string]: JSONValue } = {};
    for (const [key, value] of pairs) {
      obj[key] = value;
    }
    return obj;
  },
);
