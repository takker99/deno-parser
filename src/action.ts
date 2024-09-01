import type { InternalSourceLocation } from "../src/context.ts";

export const isOk = <A>(result: ActionResult<A>): result is ActionOK<A> =>
  result.ok;
export const isFail = <A>(result: ActionResult<A>): result is ActionFail =>
  !result.ok;

/**
 * The result of a {@linkcode Parser} callback.
 * It is either an {@linkcode ActionOK} or an {@linkcode ActionFail}.
 */
export type ActionResult<A> = ActionOK<A> | ActionFail;

/**
 * Represents a successful result from a parser's action callback. This is made
 * automatically by calling {@linkcode contextOk}. Make sure to use {@linkcode merge}
 * when writing a custom parser that executes multiple parser actions.
 */
export interface ActionOK<A> {
  /**
   * Used to check if this is an {@linkcode ActionOK} or an {@linkcode ActionFail}
   */
  ok: true;

  /**
   * A {@linkcode SourceLocation} representing where to start parsing next
   */
  location: InternalSourceLocation;

  /** The parse vaue */
  value: A;
  /**
   * A {@linkcode SourceLocation} representing the furthest any parser has gone so far
   */
  furthest: InternalSourceLocation;

  /**
   * The names of expected things to parse
   * (e.g.`["string", "number", "end of file"]`).
   */
  expected: string[];
}

export const makeActionOK = <A>(
  location: InternalSourceLocation,
  value: A,
  furthest: InternalSourceLocation,
  expected: string[],
): ActionOK<A> => ({
  ok: true,
  location,
  value,
  furthest,
  expected,
});

/**
 * Represents a successful result from a parser's action callback. This is made
 * automatically by calling {@linkcode contextOk}. Make sure to use {@linkcode merge}
 * when writing a custom parser that executes multiple parser actions.
 */
export interface ActionFail {
  /**
   * Used to check if this is an {@linkcode ActionOK} or an {@linkcode ActionFail}
   */
  ok: false;

  /**
   * A {@linkcode SourceLocation} representing the furthest any parser has gone so far
   */
  furthest: InternalSourceLocation;

  /**
   * The names of expected things to parse
   * (e.g.`["string", "number", "end of file"]`).
   */
  expected: string[];
}

export const makeActionFail = (
  furthest: InternalSourceLocation,
  expected: string[],
): ActionFail => ({ ok: false, furthest, expected });
