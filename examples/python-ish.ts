import { ok } from "../src/ok.ts";
import { fail } from "../src/fail.ts";
import { eof } from "../src/eof.ts";
import { text } from "../src/text.ts";
import { match } from "../src/match.ts";
import { lazy } from "../src/lazy.ts";
import type { Parser } from "../src/parser.ts";
import { chain } from "../src/chain.ts";
import { map } from "../src/map.ts";
import { or } from "../src/or.ts";
import { next } from "../src/next.ts";
import { repeat } from "../src/repeat.ts";
import { and } from "../src/and.ts";
import { desc } from "../src/desc.ts";

///////////////////////////////////////////////////////////////////////

type PyBlock = { type: "Block"; statements: PyStatement[] };
type PyIdent = { type: "Ident"; value: string };
type PyStatement = PyBlock | PyIdent;
interface Py {
  pyStatement: Parser<PyStatement>;
  pyRestStatement: Parser<PyStatement>;
}

/** Consume zero or more spaces and then return the number consumed. For a
 * more Python-like language, this parser would also accept tabs and then
 * expand them to the correct number of spaces
 *
 * https://docs.python.org/3/reference/lexical_analysis.html#indentation
 */
const pyCountSpaces = desc(map(match(/[ ]*/), (s) => s.length), ["ws"]);

/** Support UNIX and Windows line endings */
const pyNL = or(text("\r\n"), text("\n"));

/** Lines should always end in a newline sequence, but many files are missing
 * the final newline
 */
const pyEnd = desc(or(pyNL, eof), ["EOL"]);

/** Just a variable and then the end of the line. */
const pyIdent = map(
  and(match(/[a-z]+/i), pyEnd),
  ([value]): PyIdent => ({ type: "Ident", value }),
);

/** Because parsing indentation-sensitive languages such as Python requires
 * tracking state, all of our parsers are created inside a function that takes
 * the current parsing state. In this case it's just the current indentation
 * level, but a real Python parser would also *at least* need to keep track of
 * whether the current parsing is inside of () or [] or {} so that you can know
 * to ignore all whitespace, instead of further tracking indentation.
 *
 * Implementing all of Python's various whitespace requirements, including
 * comments and line continuations (backslash at the end of the line) is left as
 * an exercise for the reader. I've tried and frankly it's pretty tricky.
 */
const py = (indent: number): Py => {
  /** Count the current indentation level and assert it's more than the current
   * parse state's desired indentation
   */
  const pyIndentSame = chain(pyCountSpaces, (n) => {
    if (n === indent) {
      return ok(n);
    }
    return fail([`${n} spaces`]);
  });

  /** Count the current indentation level and assert it's equal to the current
   * parse state's desired indentation
   */
  const pyIndentMore = chain(pyCountSpaces, (n) => {
    if (n > indent) {
      return ok(n);
    }
    return fail([`more than ${n} spaces`]);
  });

  /** This is just a statement in our language. To simplify, this is either a
   * block of code or just an identifier
   */
  const pyStatement: Parser<PyStatement> = lazy(() => or(pyBlock, pyIdent));

  /** This is a statement which is indented to the level of the current parse
   * state. It's called RestStatement because the first statement in a block
   * is indented more than the previous state, but the *rest* of the
   * statements match up with the new state.
   */
  const pyRestStatement = next(pyIndentSame, pyStatement);

  /** This is where the magic happens. Basically we need to parse a deeper
   * indentation level on the first statement of the block and keep track of
   * new indentation level. Then we make a whole new set of parsers that use
   * that new indentation level for all their parsing. Each line past the
   * first is required to be indented to the same level as that new deeper
   * indentation level.
   */
  const pyBlock = next(
    and(text("block:"), pyNL),
    chain(pyIndentMore, (n) =>
      map(
        and(pyStatement, repeat(py(n).pyRestStatement)),
        ([first, rest]): PyBlock => ({
          type: "Block",
          statements: [first, ...rest],
        }),
      )),
  );

  return { pyStatement, pyRestStatement };
};

/** Start parsing at zero indentation */
export const Python = py(0).pyStatement;
