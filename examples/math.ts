import { ok } from "../src/ok.ts";
import { text } from "../src/text.ts";
import { match } from "../src/match.ts";
import { lazy } from "../src/lazy.ts";
import type { Parser } from "../src/parse.ts";
import { trim } from "../src/trim.ts";
import { map } from "../src/map.ts";
import { or } from "../src/or.ts";
import { wrap } from "../src/wrap.ts";
import { and } from "../src/and.ts";
import { chain } from "../src/chain.ts";
import { repeat } from "../src/repeat.ts";

// ---[ Abstract Syntax Tree and Evaluator Combined ]---

/**
 * Represents a mathematical expression.
 *
 * This interface defines the contract for a mathematical expression, which includes methods for calculating the expression's value and converting it to a string representation.
 */
export interface MathExpr {
  /** Calculates the value of the expression. */
  calculate(): number;
  /** Converts the expression to a string representation. */
  toString(): string;
}

/**
 * Represents a binary mathematical operator.
 */
export class MathOperator2 implements MathExpr {
  constructor(
    public operator: string,
    public left: MathExpr,
    public right: MathExpr,
  ) {}

  calculate(): number {
    const left = this.left.calculate();
    const right = this.right.calculate();
    switch (this.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case "**":
        return left ** right;
      default:
        throw new Error(`unexpected operator ${this.operator}`);
    }
  }

  toString(): string {
    return `(${this.left} ${this.operator} ${this.right})`;
  }
}

/**
 * Represents a unary mathematical operator.
 */
export class MathOperator1 implements MathExpr {
  constructor(public operator: string, public expression: MathExpr) {}

  calculate(): number {
    const expression = this.expression.calculate();
    switch (this.operator) {
      case "-":
        return -expression;
      default:
        throw new Error(`unexpected operator ${this.operator}`);
    }
  }

  toString(): string {
    return `(${this.operator} ${this.expression})`;
  }
}

class MathNumber implements MathExpr {
  constructor(public value: number) {}

  calculate(): number {
    return this.value;
  }

  toString() {
    return `${this.value}`;
  }
}

// ---[ Parser ]---

function token<A>(parser: Parser<A>) {
  return trim(parser, mathWS);
}

function operator<S extends string>(string: S) {
  return token(text(string));
}

const mathWS = match(/\s*/);

// Each precedence level builds upon the previous one. Meaning that the previous
// parser is used in the next parser, over and over. An astute reader could
// shorten this code using `reduce`, but it becomes much harder to read when you
// do that, in my opinion.

// Highest level
const mathNum = map(
  match(/[0-9]+([.][0-9]+)?/),
  (str) => new MathNumber(Number(str)),
);

// Next level
const mathBasic: Parser<MathExpr> = lazy(() =>
  token(
    trim(or(wrap(text("("), SimpleMath, text(")")), mathNum), mathWS),
  )
);

// Next level
const mathUnaryPrefix: Parser<MathExpr> = lazy(() =>
  or(
    map(
      and(operator("-"), mathUnaryPrefix),
      ([operator, expr]) => new MathOperator1(operator, expr),
    ),
    mathBasic,
  )
);

// Next level
const mathPow: Parser<MathExpr> = chain(mathUnaryPrefix, (expr) =>
  // Exponentiaton is right associative, meaning that `2 ** 3 ** 4` is
  // equivalent to `2 ** (3 ** 4)` rather than `(2 ** 3) ** 4`, so we can use
  // recursion to process side by side exponentiation into a nested structure.
  or(
    map(
      and(operator("**"), mathPow),
      ([operator, nextExpr]) => new MathOperator2(operator, expr, nextExpr),
    ),
    ok(expr),
  ));

// Next level
const mathMulDiv: Parser<MathExpr> = chain(mathPow, (expr) =>
  map(
    repeat(
      and(
        or(operator("*"), operator("/")),
        mathPow,
      ),
      0,
    ),
    (pairs) =>
      pairs.reduce(
        (accum, [operator, expr]) => new MathOperator2(operator, accum, expr),
        expr,
      ),
  ));

// Next level
const mathAddSub: Parser<MathExpr> = chain(mathMulDiv, (expr) =>
  map(
    repeat(
      and(
        or(
          operator("+"),
          operator("-"),
        ),
        mathMulDiv,
      ),
      0,
    ),
    (pairs) =>
      pairs.reduce(
        (accum, [operator, expr]) => new MathOperator2(operator, accum, expr),
        expr,
      ),
  ));

// Lowest level
/**
 * Represents a parser for mathematical expressions.
 */
export const SimpleMath: Parser<MathExpr> = mathAddSub;
