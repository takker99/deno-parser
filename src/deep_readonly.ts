// cf. https://ghaiklor.github.io/type-challenges-solutions/en/medium-deep-readonly.html
// cf.https://zenn.dev/knike/articles/50bd41d658f7a5#%E5%86%8D%E5%B8%B0%E7%9A%84%E3%81%AB-readonly-%E3%81%AB%E3%81%99%E3%82%8B%E5%9E%8Bdeepreadonly%3Ct%3E
export type DeepReadonly<T> = T extends [...infer _]
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T extends Set<infer U> ? ReadonlySet<DeepReadonly<U>>
  : T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Record<string, unknown>
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;
