import { node as nodeBase, type ParseNode } from "../src/node.ts";
import { text } from "../src/text.ts";
import { match } from "../src/match.ts";
import { choice } from "../src/choice.ts";
import { lazy } from "../src/lazy.ts";
import type { Parser } from "../src/types.ts";
import { desc } from "../src/desc.ts";
import { map } from "../src/map.ts";
import { repeat } from "../src/repeat.ts";
import { trim } from "../src/trim.ts";
import { wrap } from "../src/wrap.ts";
import type { TextReader } from "../src/text_parser.ts";

const node = nodeBase<TextReader>();

/** Represents a Lisp symbol. */
export type LispSymbol = ParseNode<"LispSymbol", string, TextReader>;
/** Represents a Lisp number. */
export type LispNumber = ParseNode<"LispNumber", number, TextReader>;
/** Represents a Lisp list. */
export type LispList = ParseNode<"LispList", LispExpr[], TextReader>;
/** Represents a Lisp expression. */
export type LispExpr = LispSymbol | LispNumber | LispList;

const lispExpr: Parser<LispExpr, string[]> = lazy(() =>
  choice(lispSymbol, lispNumber, lispList)
);

const lispSymbol = desc(
  node(match(/[a-z_-][a-z0-9_-]*/i), "LispSymbol"),
  ["symbol"],
);

const lispNumber = desc(
  node(
    map(match(/[0-9]+/), Number),
    "LispNumber",
  ),
  ["number"],
);

const lispWS = desc(match(/\s*/), ["ws"]);

const lispList = node(
  wrap(text("("), repeat(trim(lispExpr, lispWS)), text(")")),
  "LispList",
);

/** A Lisp file parser */
export const Lisp: Parser<
  ParseNode<"LispFile", LispExpr[], TextReader>,
  string[]
> = node(
  repeat(trim(lispExpr, lispWS)),
  "LispFile",
);
