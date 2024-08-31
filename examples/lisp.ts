import {
  choice,
  lazy,
  match,
  type ParseNode,
  type Parser,
  text,
} from "../mod.ts";

/** Represents a Lisp symbol. */
export type LispSymbol = ParseNode<"LispSymbol", string>;
/** Represents a Lisp number. */
export type LispNumber = ParseNode<"LispNumber", number>;
/** Represents a Lisp list. */
export type LispList = ParseNode<"LispList", LispExpr[]>;
/** Represents a Lisp expression. */
export type LispExpr = LispSymbol | LispNumber | LispList;

const lispExpr: Parser<LispExpr> = lazy(() => {
  return choice(lispSymbol, lispNumber, lispList);
});

const lispSymbol = match(/[a-z_-][a-z0-9_-]*/i)
  .node("LispSymbol")
  .desc(["symbol"]);

const lispNumber = match(/[0-9]+/)
  .map(Number)
  .node("LispNumber")
  .desc(["number"]);

const lispWS = match(/\s*/);

const lispList = lispExpr
  .trim(lispWS)
  .repeat()
  .wrap(text("("), text(")"))
  .node("LispList");

/** A Lisp file parser */
export const Lisp: Parser<ParseNode<"LispFile", LispExpr[]>> = lispExpr.trim(
  lispWS,
).repeat().node("LispFile");
