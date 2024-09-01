import { ok } from "../ok.ts";
import { text } from "../text.ts";
import { match } from "../match.ts";
import { all } from "../all.ts";
import { choice } from "../choice.ts";
import { lazy } from "../lazy.ts";
import type { Parser } from "../parse.ts";
import { or } from "../or.ts";
import { trim } from "../trim.ts";
import { skip } from "../skip.ts";
import { next } from "../next.ts";
import { sepBy } from "../sepBy.ts";
import { map } from "../map.ts";
import { wrap } from "../wrap.ts";
import { chain } from "../chain.ts";
import { repeat } from "../repeat.ts";

export interface XMLElement {
  name: string;
  attributes: Record<string, string>;
  children: (string | XMLElement)[];
}

// Mandatory whitespace
const W1 = match(/\s+/);

// Optional whitespace
const W0 = or(W1, ok(""));

const Word = match(/[a-zA-Z]+/);

// Proper XML attributes would support XML entities (e.g. `&amp;`)
const AttributeValue = trim(match(/[^"]+/), text('"'));

const temp = skip(Word, text("="));

// `name="value"`.
const Attribute = all(temp, AttributeValue);
// TypeScript fails to infer the type of `Attribute` here, so we have to do it.
// const Attribute = all(skip(Word, text("=")), AttributeValue);

// Both types of opening tag (`<x>` and `<x/>`) contain a name followed by
// optional attributes
const OpeningTagInsides = map(
  all(Word, or(next(W0, sepBy(Attribute, W1)), ok([]))),
  ([name, attrList]) => {
    const attributes: Record<string, string> = {};
    for (const [key, value] of attrList) {
      attributes[key] = value;
    }
    return { name, attributes };
  },
);

// `<tag>`
const OpeningTag = wrap(text("<"), OpeningTagInsides, next(W0, text(">")));

// `<tag />`
const EmptyTag = wrap(text("<"), OpeningTagInsides, next(W0, text("/>")));

// - Full elements have an opening and closing tag (e.g. `<a></a>`)
// - Empty elements just have an empty tag (e.g. `<a/>`).
const Element: Parser<XMLElement> = lazy(() =>
  skip(choice(FullElement, EmptyElement), W0)
);

// Construct an appropriate output object, and use the parsed tag name to
// create a closing tag parser on the fly, to check that a matching end tag
// is found.
const FullElement = chain(
  OpeningTag,
  ({ name, attributes }) =>
    skip(
      map(
        Children,
        (children) => ({ name, attributes, children }),
      ),
      text(`</${name}>`),
    ),
);

// Empty elements have it easier; we don't have to handle contents or a
// possible end tag.
const EmptyElement = map(
  EmptyTag,
  ({ name, attributes }) => ({ name, attributes, children: [] }),
);

// Proper XML text content would support XML entities (e.g. &amp;).
const TextContent = match(/[^<>]+/);

// An element can contain other elements, or text.
const Children = repeat(choice(Element, TextContent));

export const XML: Parser<XMLElement> = trim(Element, W0);
