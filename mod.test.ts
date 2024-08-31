import * as bnb from "./mod.ts";
import { assertSnapshot } from "@std/testing/snapshot";
import { assertEquals, assertThrows } from "@std/assert";

Deno.test("test a test", async (t) => {
  const x = bnb.text("x");
  await assertSnapshot(t, x.parse("x"));
});
Deno.test("and", async (t) => {
  const x = bnb.text("x");
  const y = bnb.text("y");
  const xy = x.and(y);
  await assertSnapshot(t, xy.parse("xy"));
});

Deno.test("and triple", async (t) => {
  const x = bnb.text("x");
  const y = bnb.text("y");
  const z = bnb.text("z");
  const xyz = x.and(y).and(z);
  await assertSnapshot(t, xyz.parse("xyz"));
});

Deno.test("and success triple 2", async (t) => {
  const x = bnb.text("x");
  const y = bnb.text("y");
  const z = bnb.text("z");
  const xyz = x.and(y).chain(([x, y]) => {
    return z.map((z) => {
      return [x, y, z] as const;
    });
  });
  await assertSnapshot(t, xyz.parse("xyz"));
});

Deno.test("and failure", async (t) => {
  const x = bnb.text("x");
  const y = bnb.text("y");
  const xy = x.and(y);
  await assertSnapshot(t, xy.parse("x"));
  await assertSnapshot(t, xy.parse("y"));
  await assertSnapshot(t, xy.parse("yx"));
  await assertSnapshot(t, xy.parse(""));
});

Deno.test("sepBy 0+", async (t) => {
  const a = bnb.text("a");
  const sep = bnb.text(",");
  const list = a.sepBy(sep);
  await assertSnapshot(t, list.parse(""));
  await assertSnapshot(t, list.parse("a"));
  await assertSnapshot(t, list.parse("a,a"));
  await assertSnapshot(t, list.parse("a,a,a"));
  await assertSnapshot(t, list.parse("a,a,b"));
  await assertSnapshot(t, list.parse("b"));
});

Deno.test("sepBy 1+", async (t) => {
  const a = bnb.text("a");
  const sep = bnb.text(",");
  const list = a.sepBy(sep, 1);
  await assertSnapshot(t, list.parse(""));
  await assertSnapshot(t, list.parse("a"));
  await assertSnapshot(t, list.parse("a,a"));
  await assertSnapshot(t, list.parse("a,a,a"));
  await assertSnapshot(t, list.parse("a,a,b"));
  await assertSnapshot(t, list.parse("b"));
});

Deno.test("sepBy 2-3", async (t) => {
  const a = bnb.text("a");
  const sep = bnb.text(",");
  const list = a.sepBy(sep, 2, 3);
  await assertSnapshot(t, list.parse(""));
  await assertSnapshot(t, list.parse("a"));
  await assertSnapshot(t, list.parse("a,a"));
  await assertSnapshot(t, list.parse("a,a,a"));
  await assertSnapshot(t, list.parse("a,a,a,a"));
  await assertSnapshot(t, list.parse("a,a,b"));
  await assertSnapshot(t, list.parse("b"));
});

Deno.test("sepBy 1-1", async (t) => {
  const a = bnb.text("a");
  const sep = bnb.text(",");
  const list = a.sepBy(sep, 1, 1);
  await assertSnapshot(t, list.parse(""));
  await assertSnapshot(t, list.parse("a"));
  await assertSnapshot(t, list.parse("a,a"));
  await assertSnapshot(t, list.parse("b"));
});

Deno.test("repeat with bad range", () => {
  const a = bnb.text("a");
  const sep = bnb.text(" ");
  assertThrows(() => a.sepBy(sep, 5, 3), "bad range");
  assertThrows(() => a.sepBy(sep, -2, 0), "bad range");
  assertThrows(() => a.sepBy(sep, 1.2, 3.4), "bad range");
});

Deno.test("repeat 0+", async (t) => {
  const a = bnb.text("a");
  const aaa = a.repeat();
  await assertSnapshot(t, aaa.parse(""));
  await assertSnapshot(t, aaa.parse("a"));
  await assertSnapshot(t, aaa.parse("aa"));
  await assertSnapshot(t, aaa.parse("aaa"));
  await assertSnapshot(t, aaa.parse("aaaa"));
  await assertSnapshot(t, aaa.parse("b"));
});

Deno.test("repeat 1+", async (t) => {
  const a = bnb.text("a");
  const aaa = a.repeat(1);
  await assertSnapshot(t, aaa.parse("a"));
  await assertSnapshot(t, aaa.parse("aa"));
  await assertSnapshot(t, aaa.parse("aaa"));
  await assertSnapshot(t, aaa.parse("aaaa"));
  await assertSnapshot(t, aaa.parse(""));
  await assertSnapshot(t, aaa.parse("b"));
});

Deno.test("repeat 2-3", async (t) => {
  const a = bnb.text("a");
  const aaa = a.repeat(2, 3);
  await assertSnapshot(t, aaa.parse("a"));
  await assertSnapshot(t, aaa.parse("aa"));
  await assertSnapshot(t, aaa.parse("aaa"));
  await assertSnapshot(t, aaa.parse("aaaa"));
  await assertSnapshot(t, aaa.parse(""));
  await assertSnapshot(t, aaa.parse("b"));
});

Deno.test("repeat infinite loop detection", () => {
  const p = bnb.text("");
  const p0 = p.repeat(0);
  const p1 = p.repeat(1);
  assertThrows(() => p0.parse("abc"), "infinite loop");
  assertThrows(() => p1.parse("abc"), "infinite loop");
});

Deno.test("all", async (t) => {
  const abc = bnb.all(bnb.text("a"), bnb.text("b"), bnb.text("c"));
  await assertSnapshot(t, abc.parse("a"));
  await assertSnapshot(t, abc.parse("aa"));
  await assertSnapshot(t, abc.parse("abc"));
  await assertSnapshot(t, abc.parse("aaaa"));
  await assertSnapshot(t, abc.parse("abb"));
  await assertSnapshot(t, abc.parse(""));
  await assertSnapshot(t, abc.parse("b"));
});

Deno.test("next", async (t) => {
  const ab = bnb.text("a").next(bnb.text("b"));
  await assertSnapshot(t, ab.parse("ab"));
  await assertSnapshot(t, ab.parse("a"));
  await assertSnapshot(t, ab.parse("b"));
  await assertSnapshot(t, ab.parse(""));
  await assertSnapshot(t, ab.parse("aba"));
});

Deno.test("skip", async (t) => {
  const ab = bnb.text("a").skip(bnb.text("b"));
  await assertSnapshot(t, ab.parse("ab"));
  await assertSnapshot(t, ab.parse("a"));
  await assertSnapshot(t, ab.parse("b"));
  await assertSnapshot(t, ab.parse(""));
  await assertSnapshot(t, ab.parse("aba"));
});

Deno.test("choice", async (t) => {
  const abc123 = bnb.choice(
    bnb.text("a"),
    bnb.text("b"),
    bnb.text("c"),
    bnb.text("1").map(() => 1 as const),
    bnb.text("2").map(() => 2 as const),
    bnb.text("3").map(() => 3 as const),
  );

  await assertSnapshot(t, abc123.parse("a"));
  await assertSnapshot(t, abc123.parse("b"));
  await assertSnapshot(t, abc123.parse("c"));
  await assertSnapshot(t, abc123.parse("1"));
  await assertSnapshot(t, abc123.parse("2"));
  await assertSnapshot(t, abc123.parse("3"));
  await assertSnapshot(t, abc123.parse("aaaa"));
  await assertSnapshot(t, abc123.parse("abb"));
  await assertSnapshot(t, abc123.parse(""));
});

Deno.test("or", async (t) => {
  const a = bnb.text("a");
  const b = bnb.text("b");
  const ab = a.or(b);
  await assertSnapshot(t, ab.parse("a"));
  await assertSnapshot(t, ab.parse("b"));
  await assertSnapshot(t, ab.parse("c"));
  await assertSnapshot(t, ab.parse("ab"));
  await assertSnapshot(t, ab.parse(""));
});

Deno.test("map", async (t) => {
  const a = bnb.text("a").map(() => 1);
  await assertSnapshot(t, a.parse("a"));
  await assertSnapshot(t, a.parse("b"));
  await assertSnapshot(t, a.parse(""));
});

Deno.test("chain", async (t) => {
  const a = bnb.text("a");
  const b = bnb.text("b");
  const ab = a.chain(() => b);
  await assertSnapshot(t, ab.parse("ab"));
  await assertSnapshot(t, ab.parse("a"));
  await assertSnapshot(t, ab.parse("b"));
  await assertSnapshot(t, ab.parse(""));
});

Deno.test("chain 2", async (t) => {
  const a = bnb.text("a");
  const b = bnb.text("b");
  const ab = a.chain(() => b);
  const ab2 = ab.chain(() => b);
  await assertSnapshot(t, ab2.parse("abb"));
  await assertSnapshot(t, ab2.parse("ab"));
  await assertSnapshot(t, ab2.parse("a"));
  await assertSnapshot(t, ab2.parse("b"));
  await assertSnapshot(t, ab2.parse(""));
});

Deno.test("chain 3", async (t) => {
  const a = bnb.text("a");
  const b = bnb.text("b");
  const c = bnb.text("c");
  const abc = a.chain(() => b).chain(() => c);
  await assertSnapshot(t, abc.parse("abc"));
  await assertSnapshot(t, abc.parse("ab"));
  await assertSnapshot(t, abc.parse("a"));
  await assertSnapshot(t, abc.parse("b"));
  await assertSnapshot(t, abc.parse("c"));
  await assertSnapshot(t, abc.parse(""));
});

Deno.test("matchEOF", async (t) => {
  const eof = bnb.eof;
  await assertSnapshot(t, eof.parse(""));
  await assertSnapshot(t, eof.parse("x"));
});

Deno.test("match", async (t) => {
  const num = bnb.match(/\d+/);
  await assertSnapshot(t, num.parse("12"));
  await assertSnapshot(t, num.parse("abc"));
  await assertSnapshot(t, num.parse(""));
});

Deno.test("match with capture", async (t) => {
  const num = bnb.match(/(\d+)/);
  await assertSnapshot(t, num.parse("12"));
  await assertSnapshot(t, num.parse("abc"));
  await assertSnapshot(t, num.parse(""));
});

Deno.test("lisp lists", async (t) => {
  const symbol = bnb.match(/[a-zA-Z_-]+/);
  const lp = bnb.text("(");
  const rp = bnb.text(")");
  const ws = bnb.match(/\s+/);
  const list = lp.next(symbol.sepBy(ws, 0)).skip(rp);
  await assertSnapshot(t, list.parse("(a b c)"));
});

Deno.test("node", async (t) => {
  const identifier = bnb
    .match(/[a-z]+/i)
    .node("Identifier")
    .desc(["identifier"]);
  await assertSnapshot(t, identifier.parse("abc"));
  const multiline = bnb.text("A\nB\nC").node("ABC");
  await assertSnapshot(t, multiline.parse("A\nB\nC"));
});

Deno.test("tryParse", async (t) => {
  const a = bnb.text("a");
  await assertSnapshot(t, a.tryParse("a"));
  await assertThrows(() => a.tryParse("b"));
});

Deno.test("desc", async (t) => {
  const num = bnb
    .match(/[0-9]+/)
    .map(Number)
    .desc(["number"]);
  await assertSnapshot(t, num.parse("9"));
  await assertSnapshot(t, num.parse("x"));
});

Deno.test("desc with node", async (t) => {
  const num = bnb
    .match(/[0-9]+/)
    .map(Number)
    .node("Number")
    .desc(["number"]);
  await assertSnapshot(t, num.parse("9"));
  await assertSnapshot(t, num.parse("x"));
});

Deno.test("thru", () => {
  const n = 4;
  const p = bnb.text("");
  const x = p.thru((parser) => {
    assertEquals(parser, p);
    return n;
  });
  assertEquals(x, n);
});

Deno.test("wrap", async (t) => {
  const p = bnb.text("x").wrap(bnb.text("<"), bnb.text(">"));
  await assertSnapshot(t, p.parse("<x>"));
  await assertSnapshot(t, p.parse("<x"));
  await assertSnapshot(t, p.parse("<"));
  await assertSnapshot(t, p.parse("x>"));
});

Deno.test("trim", async (t) => {
  const p = bnb.text("x").trim(bnb.text("~"));
  await assertSnapshot(t, p.parse("~x~"));
  await assertSnapshot(t, p.parse("~x"));
  await assertSnapshot(t, p.parse("~"));
  await assertSnapshot(t, p.parse("x>"));
});

Deno.test("fail", async (t) => {
  const p = bnb.fail(["apple", "banana"]);
  const q = bnb.text("other").or(p);
  await assertSnapshot(t, p.parse("bad"));
  await assertSnapshot(t, q.parse("bad"));
});

Deno.test("lazy", async (t) => {
  type Expr = Item | List;
  type Item = "x";
  type List = Expr[];
  const expr: bnb.Parser<Expr> = bnb.lazy(() => {
    return item.or(list);
  });
  const item = bnb.text("x");
  const list = expr.sepBy(bnb.text(" "), 0).wrap(bnb.text("("), bnb.text(")"));

  await assertSnapshot(t, expr.parse("(x x (x () (x) ((x)) x) x)"));
});

Deno.test("text", () => {
  const items = ["", "abc", "🙂", "1\n2\n3"];
  for (const str of items) {
    assertEquals(bnb.text(str).tryParse(str), str);
  }
});

Deno.test("emoji length", async (t) => {
  const smiles = "🙂🙂🙂";
  const result = bnb.text(smiles).node("Emoji");
  await assertSnapshot(t, result.tryParse(smiles));
});
