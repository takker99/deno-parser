import { all, choice, lazy, match, ok, type Parser, text } from "../mod.ts";

export interface XMLElement {
  name: string;
  attributes: Record<string, string>;
  children: (string | XMLElement)[];
}

// Mandatory whitespace
const W1 = match(/\s+/);

// Optional whitespace
const W0 = W1.or(ok(""));

const Word = match(/[a-zA-Z]+/);

// Proper XML attributes would support XML entities (e.g. `&amp;`)
const AttributeValue = match(/[^"]+/).trim(text('"'));

// `name="value"`.
const Attribute = all(Word.skip(text("=")), AttributeValue);

// Both types of opening tag (`<x>` and `<x/>`) contain a name followed by
// optional attributes
const OpeningTagInsides = all(Word, W0.next(Attribute.sepBy(W1)).or(ok([])))
  .map(([name, attrList]) => {
    const attributes: Record<string, string> = {};
    for (const [key, value] of attrList) {
      attributes[key] = value;
    }
    return { name, attributes };
  });

// `<tag>`
const OpeningTag = OpeningTagInsides.wrap(
  text("<"),
  W0.next(text(">")),
);

// `<tag />`
const EmptyTag = OpeningTagInsides.wrap(text("<"), W0.next(text("/>")));

// - Full elements have an opening and closing tag (e.g. `<a></a>`)
// - Empty elements just have an empty tag (e.g. `<a/>`).
const Element: Parser<XMLElement> = lazy(() => {
  return choice(FullElement, EmptyElement).skip(W0);
});

// Construct an appropriate output object, and use the parsed tag name to
// create a closing tag parser on the fly, to check that a matching end tag
// is found.
const FullElement = OpeningTag.chain(({ name, attributes }) => {
  return Children.map((children) => {
    return { name, attributes, children };
  }).skip(text(`</${name}>`));
});

// Empty elements have it easier; we don't have to handle contents or a
// possible end tag.
const EmptyElement = EmptyTag.map(({ name, attributes }) => {
  return { name, attributes, children: [] };
});

// Proper XML text content would support XML entities (e.g. &amp;).
const TextContent = match(/[^<>]+/);

// An element can contain other elements, or text.
const Children = choice(Element, TextContent).repeat();

export const XML: Parser<XMLElement> = Element.trim(W0);
