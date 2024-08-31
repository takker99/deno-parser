import {
  all,
  and,
  chain,
  choice,
  desc,
  eof,
  fail,
  lazy,
  map,
  match,
  next,
  node,
  or,
  parse,
  type Parser,
  sepBy,
  skip,
  text,
  thru,
  trim,
  tryParse,
  wrap,
} from "@takker/parser";
import { assertSnapshot } from "@std/testing/snapshot";
import { assertEquals, assertThrows } from "@std/assert";
import { repeat } from "@takker/parser";

Deno.test("test a test", async (t) => {
  const x = text("x");
  await assertSnapshot(t, parse(x, "x"));
});
Deno.test("and", async (t) => {
  const x = text("x");
  const y = text("y");
  const xy = and(x, y);
  await assertSnapshot(t, parse(xy, "xy"));
});

Deno.test("and triple", async (t) => {
  const x = text("x");
  const y = text("y");
  const z = text("z");
  const xyz = and(and(x, y), z);
  await assertSnapshot(t, parse(xyz, "xyz"));
});

Deno.test("and success triple 2", async (t) => {
  const x = text("x");
  const y = text("y");
  const z = text("z");
  const xyz = chain(and(x, y), ([x, y]) => {
    return map(z, (z) => {
      return [x, y, z] as const;
    });
  });
  await assertSnapshot(t, parse(xyz, "xyz"));
});

Deno.test("and failure", async (t) => {
  const x = text("x");
  const y = text("y");
  const xy = and(x, y);
  await assertSnapshot(t, parse(xy, "x"));
  await assertSnapshot(t, parse(xy, "y"));
  await assertSnapshot(t, parse(xy, "yx"));
  await assertSnapshot(t, parse(xy, ""));
});

Deno.test("sepBy 0+", async (t) => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 0);
  await assertSnapshot(t, parse(list, ""));
  await assertSnapshot(t, parse(list, "a"));
  await assertSnapshot(t, parse(list, "a,a"));
  await assertSnapshot(t, parse(list, "a,a,a"));
  await assertSnapshot(t, parse(list, "a,a,b"));
  await assertSnapshot(t, parse(list, "b"));
});

Deno.test("sepBy 1+", async (t) => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 1);
  await assertSnapshot(t, parse(list, ""));
  await assertSnapshot(t, parse(list, "a"));
  await assertSnapshot(t, parse(list, "a,a"));
  await assertSnapshot(t, parse(list, "a,a,a"));
  await assertSnapshot(t, parse(list, "a,a,b"));
  await assertSnapshot(t, parse(list, "b"));
});

Deno.test("sepBy 2-3", async (t) => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 2, 3);
  await assertSnapshot(t, parse(list, ""));
  await assertSnapshot(t, parse(list, "a"));
  await assertSnapshot(t, parse(list, "a,a"));
  await assertSnapshot(t, parse(list, "a,a,a"));
  await assertSnapshot(t, parse(list, "a,a,a,a"));
  await assertSnapshot(t, parse(list, "a,a,b"));
  await assertSnapshot(t, parse(list, "b"));
});

Deno.test("sepBy 1-1", async (t) => {
  const a = text("a");
  const sep = text(",");
  const list = sepBy(a, sep, 1, 1);
  await assertSnapshot(t, parse(list, ""));
  await assertSnapshot(t, parse(list, "a"));
  await assertSnapshot(t, parse(list, "a,a"));
  await assertSnapshot(t, parse(list, "b"));
});

Deno.test("repeat with bad range", () => {
  const a = text("a");
  const sep = text(" ");
  assertThrows(() => sepBy(a, sep, 5, 3), "bad range");
  assertThrows(() => sepBy(a, sep, -2, 0), "bad range");
  assertThrows(() => sepBy(a, sep, 1.2, 3.4), "bad range");
});

Deno.test("repeat 0+", async (t) => {
  const a = text("a");
  const aaa = repeat(a);
  await assertSnapshot(t, parse(aaa, ""));
  await assertSnapshot(t, parse(aaa, "a"));
  await assertSnapshot(t, parse(aaa, "aa"));
  await assertSnapshot(t, parse(aaa, "aaa"));
  await assertSnapshot(t, parse(aaa, "aaaa"));
  await assertSnapshot(t, parse(aaa, "b"));
});

Deno.test("repeat 1+", async (t) => {
  const a = text("a");
  const aaa = repeat(a, 1);
  await assertSnapshot(t, parse(aaa, "a"));
  await assertSnapshot(t, parse(aaa, "aa"));
  await assertSnapshot(t, parse(aaa, "aaa"));
  await assertSnapshot(t, parse(aaa, "aaaa"));
  await assertSnapshot(t, parse(aaa, ""));
  await assertSnapshot(t, parse(aaa, "b"));
});

Deno.test("repeat 2-3", async (t) => {
  const a = text("a");
  const aaa = repeat(a, 2, 3);
  await assertSnapshot(t, parse(aaa, "a"));
  await assertSnapshot(t, parse(aaa, "aa"));
  await assertSnapshot(t, parse(aaa, "aaa"));
  await assertSnapshot(t, parse(aaa, "aaaa"));
  await assertSnapshot(t, parse(aaa, ""));
  await assertSnapshot(t, parse(aaa, "b"));
});

Deno.test("repeat infinite loop detection", () => {
  const p = text("");
  const p0 = repeat(p, 0);
  const p1 = repeat(p, 1);
  assertThrows(() => parse(p0, "abc"), "infinite loop");
  assertThrows(() => parse(p1, "abc"), "infinite loop");
});

Deno.test("all", async (t) => {
  const abc = all(text("a"), text("b"), text("c"));
  await assertSnapshot(t, parse(abc, "a"));
  await assertSnapshot(t, parse(abc, "aa"));
  await assertSnapshot(t, parse(abc, "abc"));
  await assertSnapshot(t, parse(abc, "aaaa"));
  await assertSnapshot(t, parse(abc, "abb"));
  await assertSnapshot(t, parse(abc, ""));
  await assertSnapshot(t, parse(abc, "b"));
});

Deno.test("next", async (t) => {
  const ab = next(text("a"), text("b"));
  await assertSnapshot(t, parse(ab, "ab"));
  await assertSnapshot(t, parse(ab, "a"));
  await assertSnapshot(t, parse(ab, "b"));
  await assertSnapshot(t, parse(ab, ""));
  await assertSnapshot(t, parse(ab, "aba"));
});

Deno.test("skip", async (t) => {
  const ab = skip(text("a"), text("b"));
  await assertSnapshot(t, parse(ab, "ab"));
  await assertSnapshot(t, parse(ab, "a"));
  await assertSnapshot(t, parse(ab, "b"));
  await assertSnapshot(t, parse(ab, ""));
  await assertSnapshot(t, parse(ab, "aba"));
});

Deno.test("choice", async (t) => {
  const abc123 = choice(
    text("a"),
    text("b"),
    text("c"),
    map(text("1"), () => 1 as const),
    map(text("2"), () => 2 as const),
    map(text("3"), () => 3 as const),
  );

  await assertSnapshot(t, parse(abc123, "a"));
  await assertSnapshot(t, parse(abc123, "b"));
  await assertSnapshot(t, parse(abc123, "c"));
  await assertSnapshot(t, parse(abc123, "1"));
  await assertSnapshot(t, parse(abc123, "2"));
  await assertSnapshot(t, parse(abc123, "3"));
  await assertSnapshot(t, parse(abc123, "aaaa"));
  await assertSnapshot(t, parse(abc123, "abb"));
  await assertSnapshot(t, parse(abc123, ""));
});

Deno.test("or", async (t) => {
  const a = text("a");
  const b = text("b");
  const ab = or(a, b);
  await assertSnapshot(t, parse(ab, "a"));
  await assertSnapshot(t, parse(ab, "b"));
  await assertSnapshot(t, parse(ab, "c"));
  await assertSnapshot(t, parse(ab, "ab"));
  await assertSnapshot(t, parse(ab, ""));
});

Deno.test("map", async (t) => {
  const a = map(text("a"), () => 1 as const);
  await assertSnapshot(t, parse(a, "a"));
  await assertSnapshot(t, parse(a, "b"));
  await assertSnapshot(t, parse(a, ""));
});

Deno.test("chain", async (t) => {
  const a = text("a");
  const b = text("b");
  const ab = chain(a, () => b);
  await assertSnapshot(t, parse(ab, "ab"));
  await assertSnapshot(t, parse(ab, "a"));
  await assertSnapshot(t, parse(ab, "b"));
  await assertSnapshot(t, parse(ab, ""));
});

Deno.test("matchEOF", async (t) => {
  await assertSnapshot(t, parse(eof, ""));
  await assertSnapshot(t, parse(eof, "x"));
});

Deno.test("match", async (t) => {
  const num = match(/\d+/);
  await assertSnapshot(t, parse(num, "12"));
  await assertSnapshot(t, parse(num, "abc"));
  await assertSnapshot(t, parse(num, ""));
});

Deno.test("match with capture", async (t) => {
  const num = match(/(\d+)/);
  await assertSnapshot(t, parse(num, "12"));
  await assertSnapshot(t, parse(num, "abc"));
  await assertSnapshot(t, parse(num, ""));
});

Deno.test("lisp lists", async (t) => {
  const symbol = match(/[a-zA-Z_-]+/);
  const lp = text("(");
  const rp = text(")");
  const ws = match(/\s+/);
  const list = skip(next(lp, sepBy(symbol, ws, 0)), rp);
  await assertSnapshot(t, parse(list, "(a b c)"));
});

Deno.test("node", async (t) => {
  const identifier = desc(node(match(/[a-z]+/i), "Identifier"), ["identifier"]);
  await assertSnapshot(t, parse(identifier, "abc"));
  const multiline = node(text("A\nB\nC"), "ABC");
  await assertSnapshot(t, parse(multiline, "A\nB\nC"));
});

Deno.test("tryParse", async (t) => {
  const a = text("a");
  await assertSnapshot(t, tryParse(a, "a"));
  await assertThrows(() => tryParse(a, "b"));
});

Deno.test("desc", async (t) => {
  const num = desc(map(match(/[0-9]+/), Number), ["number"]);
  await assertSnapshot(t, parse(num, "9"));
  await assertSnapshot(t, parse(num, "x"));
});

Deno.test("desc with node", async (t) => {
  const num = desc(node(map(match(/[0-9]+/), Number), "Number"), ["number"]);
  await assertSnapshot(t, parse(num, "9"));
  await assertSnapshot(t, parse(num, "x"));
});

Deno.test("thru", () => {
  const n = 4;
  const p = text("");
  const x = thru(p, (parser) => {
    assertEquals(parser, p);
    return n;
  });
  assertEquals(x, n);
});

Deno.test("wrap", async (t) => {
  const p = wrap(text("<"), text("x"), text(">"));
  await assertSnapshot(t, parse(p, "<x>"));
  await assertSnapshot(t, parse(p, "<x"));
  await assertSnapshot(t, parse(p, "<"));
  await assertSnapshot(t, parse(p, "x>"));
});

Deno.test("trim", async (t) => {
  const p = trim(text("x"), text("~"));
  await assertSnapshot(t, parse(p, "~x~"));
  await assertSnapshot(t, parse(p, "~x"));
  await assertSnapshot(t, parse(p, "~"));
  await assertSnapshot(t, parse(p, "x>"));
});

Deno.test("fail", async (t) => {
  const p = fail(["apple", "banana"]);
  const q = or(text("other"), p);
  await assertSnapshot(t, parse(p, "bad"));
  await assertSnapshot(t, parse(q, "bad"));
});

Deno.test("lazy", async (t) => {
  type Expr = Item | List;
  type Item = "x";
  type List = Expr[];
  const expr: Parser<Expr> = lazy(() => {
    return or(item, list);
  });
  const item = text("x");
  const list = wrap(text("("), sepBy(expr, text(" "), 0), text(")"));

  await assertSnapshot(t, parse(expr, "(x x (x () (x) ((x)) x) x)"));
});

Deno.test("text", () => {
  const items = ["", "abc", "🙂", "1\n2\n3"];
  for (const str of items) {
    assertEquals(tryParse(text(str), str), str);
  }
});

Deno.test("emoji length", async (t) => {
  const smiles = "🙂🙂🙂";
  const result = node(text(smiles), "Emoji");
  await assertSnapshot(t, tryParse(result, smiles));
});
