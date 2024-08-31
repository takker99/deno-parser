/**
 * The parsing action.
 * This should only be called directly when writing custom parsers.
 *
 * **Note:** Make sure to use {@linkcode merge} when combining multiple
 * {@linkcode ActionResult}s or else you will lose important parsing information.
 *
 * @param context A parsing context
 * @returns An {@linkcode ActionResult}
 */
export type Parser<A> = (context: Context) => ActionResult<A>;

export type ParserResult<P> = P extends Parser<infer A> ? A : never;

/**
 * Returns a parse result with either the value or error information.
 */
export const parse = <A>(
  parser: Parser<A>,
  input: string,
): ParseOK<A> | ParseFail => {
  const context: Context = {
    input,
    location: { index: 0, line: 1, column: 1 },
  };
  const result = skip(parser, eof)(context);
  if (isOk(result)) {
    return {
      type: "ParseOK",
      value: result.value,
    };
  }
  return {
    type: "ParseFail",
    location: result.furthest,
    expected: result.expected,
  };
};
/**
 * Returns the parsed result or throws an error.
 */
export const tryParse = <A>(parser: Parser<A>, input: string): A => {
  const result = parse(parser, input);
  if (result.type === "ParseOK") {
    return result.value;
  }
  const { expected, location } = result;
  const { line, column } = location;
  const message = `parse error at line ${line} column ${column}: ` +
    `expected ${expected.join(", ")}`;
  throw new Error(message);
};

/**
 * Combines two parsers one after the other, yielding the results of both in
 * an array.
 */
export const and =
  <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<[A, B]> =>
  (
    context,
  ) => {
    const a = parserA(context);
    if (isFail(a)) {
      return a;
    }
    context = moveTo(context, a.location);
    const b = merge(a, parserB(context));
    if (isOk(b)) {
      const value: [A, B] = [a.value, b.value];
      return merge(b, contextOk(context, b.location.index, value));
    }
    return b;
  };
/** Parse both and return the value of the first */
export const skip = <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<A> =>
  map(and(parserA, parserB), ([a]) => a);

/** Parse both and return the value of the second */
export const next = <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<B> =>
  map(and(parserA, parserB), ([, b]) => b);

/**
 * Try to parse using the current parser. If that fails, parse using the
 * second parser.
 */
export const or =
  <A, B>(parserA: Parser<A>, parserB: Parser<B>): Parser<A | B> =>
  (
    context,
  ) => {
    const a = parserA(context);
    if (isOk(a)) {
      return a;
    }
    return merge(a, parserB(context));
  };
/**
 * Parse using the current parser. If it succeeds, pass the value to the
 * callback function, which returns the next parser to use.
 */
export const chain =
  <A, B>(parser: Parser<A>, fn: (value: A) => Parser<B>): Parser<B> =>
  (context) => {
    const a = parser(context);
    if (isFail(a)) {
      return a;
    }
    const parserB = fn(a.value);
    context = moveTo(context, a.location);
    return merge(a, parserB(context));
  };

/**
 * Yields the value from the parser after being called with the callback.
 */
export const map = <A, B>(parser: Parser<A>, fn: (value: A) => B): Parser<B> =>
  chain(parser, (a) => ok(fn(a)));

/**
 * Returns the callback called with the parser.
 */
export const thru = <A, B>(
  parser: Parser<A>,
  fn: (parser: Parser<A>) => B,
): B => fn(parser);

/**
 * Returns a parser which parses the same value, but discards other error
 * messages, using the ones supplied instead.
 */
export const desc =
  <A>(parser: Parser<A>, expected: string[]): Parser<A> => (context) => {
    const result = parser(context);
    return isOk(result) ? result : makeActionFail(result.furthest, expected);
  };

/**
 * Wraps the current parser with before & after parsers.
 */
export const wrap = <B, A, C>(
  before: Parser<B>,
  parser: Parser<A>,
  after: Parser<C>,
): Parser<A> => skip(next(before, parser), after);

/**
 * Ignores content before and after the current parser, based on the supplied
 * parser.
 */
export const trim = <A, B>(
  parser: Parser<A>,
  beforeAndAfter: Parser<B>,
): Parser<A> => wrap(beforeAndAfter, parser, beforeAndAfter);

/**
 * Repeats the current parser between min and max times, yielding the results
 * in an array.
 */
export const repeat = <A>(
  parser: Parser<A>,
  min = 0,
  max = Infinity,
): Parser<A[]> => {
  if (!isRangeValid(min, max)) {
    throw new Error(`repeat: bad range (${min} to ${max})`);
  }
  if (min === 0) {
    return or(repeat(parser, 1, max), ok([]));
  }
  return (context) => {
    const items: A[] = [];
    let result = parser(context);
    if (isFail(result)) {
      return result;
    }
    while (isOk(result) && items.length < max) {
      items.push(result.value);
      if (result.location.index === context.location.index) {
        throw new Error(
          "infinite loop detected; don't call .repeat() with parsers that can accept zero characters",
        );
      }
      context = moveTo(context, result.location);
      result = merge(result, parser(context));
    }
    if (isFail(result) && items.length < min) {
      return result;
    }
    return merge(result, contextOk(context, context.location.index, items));
  };
};

/**
 * Returns a parser that parses between min and max times, separated by the separator
 * parser supplied.
 */
export const sepBy = <A, B>(
  parser: Parser<A>,
  separator: Parser<B>,
  min = 0,
  max = Infinity,
): Parser<A[]> => {
  if (!isRangeValid(min, max)) {
    throw new Error(`sepBy: bad range (${min} to ${max})`);
  }
  if (min === 0) {
    return or(sepBy(parser, separator, 1, max), ok([]));
  }
  // We also know that min=1 due to previous checks, so we can skip the call
  // to `repeat` here
  if (max === 1) {
    return map(parser, (x) => [x]);
  }
  return chain(
    parser,
    (first) =>
      map(
        repeat(next(separator, parser), min - 1, max - 1),
        (rest) => [first, ...rest],
      ),
  );
};

/**
 * Returns a parser that adds `name` and start/end location metadata.
 *
 * This should be used heavily within your parser so that you can do proper error
 * reporting. You may also wish to keep this information available in the runtime
 * of your language for things like stack traces.
 *
 * This is just a convenience method built around `location`. Don't hesitate to
 * avoid this function and instead use {@linkcode thru} call your own custom node creation
 * function that fits your domain better.
 *
 * Location `index` is 0-indexed and `line`/`column` information is 1-indexed.
 *
 * **Note:** The `end` location is _exclusive_ of the parse (one character further)
 *
 * @example Basic Usage
 * ```ts
 * import { node, match, tryParse } from "@takker/parser";
 *
 * const identifier = node(match(/[a-z]+/i), "Identifier");
 * tryParse(identifier, "hello");
 * // => {
 * //   type: "ParseNode",
 * //   name: "Identifier",
 * //   value: "hello",
 * //   start: SourceLocation { index: 0, line: 1, column: 1 },
 * //   end: SourceLocation { index: 5, line: 1, column: 6 } }
 * // }
 * ```
 *
 * @example Create type aliases for TypeScript use
 * ```ts
 * import type { ParseNode } from "@takker/parser";
 *
 * type LispSymbol = ParseNode<"LispSymbol", string>;
 * type LispNumber = ParseNode<"LispNumber", number>;
 * type LispList = ParseNode<"LispList", LispExpr[]>;
 * type LispExpr = LispSymbol | LispNumber | LispList;
 * ```
 */
export const node = <A, S extends string>(
  parser: Parser<A>,
  name: S,
): Parser<ParseNode<S, A>> =>
  map(
    all(location, parser, location),
    ([start, value, end]) =>
      ({ type: "ParseNode", name, value, start, end }) as const,
  );

const isRangeValid = (min: number, max: number): boolean =>
  min <= max &&
  min >= 0 &&
  max >= 0 &&
  Number.isInteger(min) &&
  min !== Infinity &&
  (Number.isInteger(max) || max === Infinity);

/**
 * Result type from {@linkcode node}.
 * See {@linkcode node} for more details.
 */
export interface ParseNode<S extends string, A> {
  type: "ParseNode";
  name: S;
  value: A;
  start: SourceLocation;
  end: SourceLocation;
}

/**
 * Parser that yields the current {@linkcode SourceLocation}, containing properties
 * `index`, `line` and `column`.
 * Useful when used before and after a given parser,
 * so you can know the source range for highlighting errors.
 * Used internally by {@linkcode node}.
 *
 * @example
 * ```ts
 * import { chain, location, map, match, tryParse } from "@takker/parser";
 *
 * const identifier = chain(location, (start) => {
 *   return chain(match(/[a-z]+/i), (name) => {
 *     return map(location, (end) => {
 *       return { type: "Identifier", name, start, end };
 *     });
 *   });
 * });
 * tryParse(identifier, "abc");
 * // => {
 * //   type: "Identifier",
 * //   name: "abc",
 * //   start: SourceLocation { index: 0, line: 1, column: 1 },
 * //   end: SourceLocation { index: 2, line: 1, column: 3 }
 * // }
 * ```
 */
export const location: Parser<SourceLocation> = (context) =>
  contextOk(context, context.location.index, context.location);

/**
 * Returns a parser that yields the given value and consumes no input.
 */
export const ok = <A>(value: A): Parser<A> => (context) =>
  contextOk(context, context.location.index, value);

/**
 * Returns a parser that fails with the given messages and consumes no input.
 */
export const fail = <A>(expected: string[]): Parser<A> => (context) =>
  contextFail(context, context.location.index, expected);

const EOF = "<EOF>" as const;

/**
 * This parser succeeds if the input has already been fully parsed.
 *
 * Typically you won't need to use this since {@linkcode parse} already checks this for you.
 * But if your language uses newlines to terminate statements, you might want to check for
 * newlines **or** eof in case the text file doesn't end with a trailing newline
 * (many text editors omit this character).
 *
 * @example
 * ```ts
 * import { and, eof, map, match, or, repeat, tryParse } from "@takker/parser";
 *
 * const endline = or(match(/\r?\n/), eof);
 * const statement = map(
 *   and(match(/[a-z]+/i), endline),
 *   ([first]) => first,
 * );
 * const file = repeat(statement);
 * tryParse(file, "A\nB\nC"); // => ["A", "B", "C"]
 * ```
 */
export const eof: Parser<"<EOF>"> = (context) => {
  const i = context.location.index;
  return i < context.input.length
    ? contextFail(context, i, [EOF])
    : contextOk(context, i, EOF);
};

/** Returns a parser that matches the exact `string` supplied.
 *
 * This is typically used for things like parsing keywords (`for`, `while`, `if`,
 * `else`, `let`...), or parsing static characters such as `{`, `}`, `"`, `'`...
 *
 * @example
 * ```ts
 * import { and, text, tryParse } from "@takker/parser";
 * const keywordWhile = text("while");
 * const paren = and(text("("), text(")"));
 * tryParse(keywordWhile, "while"); // => "while"
 * tryParse(paren, "()"); // => ["(", ")"]
 * ```
 */
export const text = <A extends string>(string: A): Parser<A> => (context) => {
  const start = context.location.index;
  const end = start + string.length;
  if (context.input.slice(start, end) == string) {
    return contextOk(context, end, string);
  }
  return contextFail(context, start, [string]);
};

/**
 * Returns a parser that matches the entire `regexp` at the current parser
 * position.
 *
 * The following regexp flags are supported (any other regexp flag will throw an
 * error):
 *
 * - `i`
 *   ([ignoreCase](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/ignoreCase))
 * - `s`
 *   ([dotAll](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/dotAll))
 * - `m`
 *   ([multiline](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/multiline))
 * - `u`
 *   ([unicode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicode))
 *
 * **Note:** Do not use the `^` anchor at the beginning of your regular expression.
 * This internally uses sticky (`/.../y`) regular expressions with `lastIndex` set
 * to the current parsing index.
 *
 * **Note:** Capture groups `()` are not significant to this parser. The entire
 * match is returned regardless of any capture groups used.
 *
 * @example
 * ```ts
 * import { match, tryParse } from "@takker/parser";
 * const identifier = match(/[a-z_]+/i);
 * tryParse(identifier, "internal_toString");
 * // => "internal_toString"
 *
 * const number = match(/[0-9]+/);
 * tryParse(number, "404");
 * // => 404
 * ```
 */
export const match = (regexp: RegExp): Parser<string> => {
  for (const flag of regexp.flags) {
    switch (flag) {
      case "i": // ignoreCase
      case "s": // dotAll
      case "m": // multiline
      case "u": // unicode
        continue;
      default:
        throw new Error("only the regexp flags 'imsu' are supported");
    }
  }
  const sticky = new RegExp(regexp.source, regexp.flags + "y");
  return (context) => {
    const start = context.location.index;
    sticky.lastIndex = start;
    const match = context.input.match(sticky);
    if (match) {
      const end = start + match[0].length;
      const string = context.input.slice(start, end);
      return contextOk(context, end, string);
    }
    return contextFail(context, start, [String(regexp)]);
  };
};

/** A tuple of parsers */
// deno-lint-ignore no-explicit-any
type ManyParsers<A extends any[]> = {
  [P in keyof A]: Parser<A[P]>;
};

/** Parses all parsers in order, returning the values in the same order.
 *
 * **Note:** The parsers do not all have to return the same type.
 *
 * See also {@linkcode Parser.and}
 *
 * @example
 * ```ts
 * import { all, map, text, tryParse } from "@takker/parser";
 *
 * const abc = map(
 *   all(text("a"), text("b"), text("c")),
 *   ([first, second, third]) => {
 *     return { first, second, third };
 *   },
 * );
 *
 * tryParse(abc, "abc");
 * // => {
 * //   first: "a",
 * //   second: "b",
 * //   third: "c",
 * // }
 * ```
 */
// deno-lint-ignore no-explicit-any
export const all = <A extends any[]>(...parsers: ManyParsers<A>): Parser<A> =>
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce(
    (acc, p) => chain(acc, (array) => map(p, (value) => [...array, value])),
    ok([]),
  );

/** Parse using the parsers given, returning the first one that succeeds. */
// deno-lint-ignore no-explicit-any
export const choice = <Parsers extends Parser<any>[]>(
  ...parsers: Parsers
): Parser<ParserResult<Parsers[number]>> =>
  // TODO: This could be optimized with a custom parser, but I should probably add
  // benchmarking first to see if it really matters enough to rewrite it
  parsers.reduce((acc, p) => or(acc, p));

/**
 * Takes a lazily invoked callback that returns a parser, so you can create
 * recursive parsers.
 */
export const lazy = <A>(fn: () => Parser<A>): Parser<A> =>
// NOTE: This parsing action overwrites itself on the specified parser. We're
// assuming that the same parser won't be returned to multiple `lazy` calls. I
// never heard of such a thing happening in Parsimmon, and it doesn't seem
// likely to happen here either. I assume this is faster than using variable
// closure and an `if`-statement here, but I honestly don't know.
(context) => fn()(context);

/**
 * Represents a location in the input (source code). Keeps track of `index` (for
 * use with `.slice` and such), as well as `line` and `column` for displaying to
 * users.
 *
 * The `index` is counted as you would normally index a string for use with `.slice` and such.
 * But the `line` and `column` properly count complex Unicode characters like emojis.
 * Each `\n` character separates lines.
 */
export interface SourceLocation {
  /** The string index into the input (e.g. for use with `.slice`) */
  index: number;
  /**
   * The line number for error reporting. Only the character `\n` is used to
   * signify the beginning of a new line.
   *
   * **Note:** This is 1-indexed.
   */
  line: number;
  /**
   * The column number for error reporting.
   *
   * **Note:** This is 1-indexed.
   */
  column: number;
}

/**
 * The result of a {@linkcode Parser} callback.
 * It is either an {@linkcode ActionOK} or an {@linkcode ActionFail}.
 */
export type ActionResult<A> = ActionOK<A> | ActionFail;

const ACTION_OK = "ActionOK" as const;
const ACTION_FAIL = "ActionFail" as const;

const isOk = <A>(result: ActionResult<A>): result is ActionOK<A> =>
  result.type == ACTION_OK;
const isFail = <A>(result: ActionResult<A>): result is ActionFail =>
  result.type == ACTION_FAIL;

/**
 * Represents a successful result from a parser's action callback. This is made
 * automatically by calling {@linkcode Context.ok}. Make sure to use {@linkcode merge}
 * when writing a custom parser that executes multiple parser actions.
 */
export interface ActionOK<A> {
  /**
   * Used to check if this is an {@linkcode ActionOK} or an {@linkcode ActionFail}
   */
  type: "ActionOK";

  /**
   * A {@linkcode SourceLocation} representing where to start parsing next
   */
  location: SourceLocation;

  /** The parse vaue */
  value: A;
  /**
   * A {@linkcode SourceLocation} representing the furthest any parser has gone so far
   */
  furthest: SourceLocation;

  /**
   * The names of expected things to parse
   * (e.g.`["string", "number", "end of file"]`).
   */
  expected: string[];
}

const makeActionOK = <A>(
  location: SourceLocation,
  value: A,
  furthest: SourceLocation,
  expected: string[],
): ActionOK<A> => ({
  type: ACTION_OK,
  location,
  value,
  furthest,
  expected,
});

/**
 * Represents a successful result from a parser's action callback. This is made
 * automatically by calling {@linkcode Context.ok}. Make sure to use {@linkcode merge}
 * when writing a custom parser that executes multiple parser actions.
 */
export interface ActionFail {
  /**
   * Used to check if this is an {@linkcode ActionOK} or an {@linkcode ActionFail}
   */
  type: "ActionFail";

  /**
   * A {@linkcode SourceLocation} representing the furthest any parser has gone so far
   */
  furthest: SourceLocation;

  /**
   * The names of expected things to parse
   * (e.g.`["string", "number", "end of file"]`).
   */
  expected: string[];
}

const makeActionFail = (
  furthest: SourceLocation,
  expected: string[],
): ActionFail => ({ type: ACTION_FAIL, furthest, expected });

const union = (
  a: string[],
  b: string[],
): string[] => [...new Set([...a, ...b])];

/**
 * Represents the current parsing context.
 *
 * It is passed to every {@linkcode Parser}.
 * Generally you will return a call to the {@linkcode contextOk} or {@linkcode contextFail} from inside a custom parser.
 *
 * While you can construct your own `Context` directly, it is not necessary or advised.
 *
 * @example
 * ```ts
 * import { contextOk, contextFail, type Parser } from "@takker/parser";
 *
 * const bracket: Parser<"[" | "]"> = (context) => {
 *   const start = context.location.index;
 *   const end = start + 1;
 *   const ch = context.input.slice(start, end);
 *   if (ch === "[" || ch === "]") {
 *     return contextOk(context, end, ch);
 *   }
 *   return contextFail(context, start, ["[", "]"]);
 * };
 * ```
 */
export interface Context {
  /** The current parsing input */
  input: string;

  /** The current parsing location */
  location: SourceLocation;
}

/**
 * Returns a new context with the supplied location and the current input.
 *
 * Returns a new context using the provided source location.
 *
 * See {@linkcode merge} for an example.
 */
export const moveTo = (
  context: Context,
  location: SourceLocation,
): Context => ({
  input: context.input,
  location,
});

const internalMove = (context: Context, index: number): SourceLocation => {
  const location = context.location;
  const start = location.index;
  if (index == start) return location;

  const end = index;
  const chunk = context.input.slice(start, end);
  let { line, column } = location;
  for (const ch of chunk) {
    if (ch == "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { index, line, column };
};

/**
 * Represents a successful parse ending before the given `index`, with the
 * specified `value`.
 *
 * This function takes a new source `index` and a parse `value`,
 * returning a {@linkcode ActionOK}
 *
 * This should be returned inside custom parsers.
 *
 * @param context A current parsing context
 * @param index A new source index representing the next character to parse
 * @param value A parsed value
 * @returns A {@linkcode ActionOK}
 */
export const contextOk = <A>(
  context: Context,
  index: number,
  value: A,
): ActionOK<A> =>
  makeActionOK(internalMove(context, index), value, {
    index: -1,
    line: -1,
    column: -1,
  }, []);

/**
 * Represents a failed parse starting at the given `index`, with the specified
 * list `expected` messages (note: this list usually only has one item).
 *
 * This function takes a new source `index` and a list of `expected` values,
 * returning a {@linkcode ActionFail}
 *
 * This should be returned inside custom parsers.
 *
 * @param context A current parsing context
 * @param index A new source index representing where the parse failed
 * @param expected A list of expected thins at the location the parse failed
 * @returns A {@linkcode ActionFail}
 */
export const contextFail = (
  context: Context,
  index: number,
  expected: string[],
): ActionFail => makeActionFail(internalMove(context, index), expected);

/**
 * Merge two sequential {@linkcode ActionResult}s so that the `expected` and location data
 * is preserved correctly.
 *
 * Takes `result1` and merges its `expected` values with `result2`, allowing error messages to be preserved.
 *
 * @example
 * ```ts
 * import { contextOk, merge, moveTo, type Parser } from "@takker/parser";
 *
 * // NOTE: This is not the shortest way to write this parser,
 * // it's just an example of a custom parser that needs to
 * // call multiple other parsers.
 * function multiply(
 *   parser1: Parser<number>,
 *   parser2: Parser<number>,
 * ): Parser<number> {
 *   return (context) => {
 *     const result1 = parser1(context);
 *     if (result1.type === "ActionFail") {
 *       return result1;
 *     }
 *     const result2 = merge(result1, parser2(context));
 *     if (result2.type === "ActionFail") {
 *       return result2;
 *     }
 *     context = moveTo(moveTo(context, result1.location), result2.location);
 *     const value = result1.value * result2.value;
*     return merge(result2, contextOk(context, context.location.index, value));
 *   };
 * }
 * ```
 */
export const merge = <A, B>(
  a: ActionResult<A>,
  b: ActionResult<B>,
): ActionResult<B> => {
  if (b.furthest.index > a.furthest.index) {
    return b;
  }
  const expected = b.furthest.index === a.furthest.index
    ? union(a.expected, b.expected)
    : a.expected;
  return isOk(b)
    ? makeActionOK(b.location, b.value, a.furthest, expected)
    : makeActionFail(a.furthest, expected);
};
/**
 * Represents a successful parse result.
 */
export interface ParseOK<A> {
  type: "ParseOK";
  /** The parsed value */
  value: A;
}

/**
 * Represents a failed parse result, where it failed, and what types of
 * values were expected at the point of failure.
 */
export interface ParseFail {
  type: "ParseFail";
  /** The input location where the parse failed */
  location: SourceLocation;
  /** List of expected values at the location the parse failed */
  expected: string[];
}
