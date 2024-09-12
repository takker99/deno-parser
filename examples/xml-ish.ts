import { ok } from "../src/ok.ts";
import { text } from "../src/text.ts";
import { match } from "../src/match.ts";
import { all } from "../src/all.ts";
import type { Parser } from "../src/parser.ts";
import { or } from "../src/or.ts";
import { trim } from "../src/trim.ts";
import { skip } from "../src/skip.ts";
import { sepBy } from "../src/sepBy.ts";
import { map } from "../src/map.ts";
import { wrap } from "../src/wrap.ts";
import { chain } from "../src/chain.ts";
import { repeat } from "../src/repeat.ts";
import { and } from "../src/and.ts";

export interface XMLElement {
  readonly name: string;
  readonly attributes: Record<string, string>;
  readonly children: (string | XMLElement)[];
}

/** Mandatory whitespace */
const W1 = match(/\s+/);

/** Optional whitespace */
const W0 = or(W1, ok(""));

const Word = match(/[a-zA-Z]+/);

/** Proper XML attributes would support XML entities (e.g. `&amp;`) */
const AttributeValue = trim(match(/[^"]+/), text('"'));

/** `name="value"`. */
const Attribute = and(skip(Word, text("=")), AttributeValue);

/** Both types of opening tag (`<x>` and `<x/>`) contain a name followed by
 * optional attributes
 */
const OpeningTagInsides = map(
  all(Word, W0, sepBy(Attribute, W1)),
  ([name, , attrList]) => ({ name, attributes: Object.fromEntries(attrList) }),
);

/** `<tag>` */
const OpeningTag = wrap(text("<"), OpeningTagInsides, and(W0, text(">")));

/** `<tag />` */
const EmptyTag = wrap(text("<"), OpeningTagInsides, and(W0, text("/>")));

/** Construct an appropriate output object, and use the parsed tag name to
 * create a closing tag BaseParser on the fly, to check that a matching end tag
 * is found.
 */
const FullElement = chain(
  OpeningTag,
  ({ name, attributes }) =>
    map(
      and(Children, text(`</${name}>`)),
      ([children]): XMLElement => ({ name, attributes, children }),
    ),
);

/** Empty elements have it easier; we don't have to handle contents or a
 * possible end tag.
 */
const EmptyElement = map(
  EmptyTag,
  (element): XMLElement => ({ ...element, children: [] }),
);

/** Proper XML text content would support XML entities (e.g. &amp;). */
const TextContent = match(/[^<>]+/);

/** - Full elements have an opening and closing tag (e.g. `<a></a>`)
 * - Empty elements just have an empty tag (e.g. `<a/>`).
 */
const Element: Parser<XMLElement> = skip(or(FullElement, EmptyElement), W0);

/** An element can contain other elements, or text. */
const Children = repeat(or(Element, TextContent));

export const XML: Parser<XMLElement> = trim(Element, W0);
