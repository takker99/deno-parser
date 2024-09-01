import { node, type ParseNode } from "../src/node.ts";
import { text } from "../src/text.ts";
import { match } from "../src/match.ts";
import { choice } from "../src/choice.ts";
import { lazy } from "../src/lazy.ts";
import type { Parser } from "../src/parse.ts";
import { desc } from "../src/desc.ts";
import { map } from "../src/map.ts";
import { repeat } from "../src/repeat.ts";
import { trim } from "../src/trim.ts";
import { wrap } from "../src/wrap.ts";

/** Represents a Lisp symbol. */
export type LispSymbol = ParseNode<"LispSymbol", string>;
/** Represents a Lisp number. */
export type LispNumber = ParseNode<"LispNumber", number>;
/** Represents a Lisp list. */
export type LispList = ParseNode<"LispList", LispExpr[]>;
/** Represents a Lisp expression. */
export type LispExpr = LispSymbol | LispNumber | LispList;

const lispExpr: Parser<LispExpr> = lazy(() =>
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

const lispWS = match(/\s*/);

const lispList = node(
  wrap(text("("), repeat(trim(lispExpr, lispWS)), text(")")),
  "LispList",
);

/** A Lisp file parser */
export const Lisp: Parser<ParseNode<"LispFile", LispExpr[]>> = node(
  repeat(trim(lispExpr, lispWS)),
  "LispFile",
);
