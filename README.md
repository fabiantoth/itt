# itt

Iteration tools.

# Install

```
$ npm i itt
```

# Use

```js
const itt = require('itt')
```

# API

**Constructors** — [from(…)](#ittthing-ittfromthing) [range(…)](#rangestart--0-end-skip--1) [irange(…)](#irangestart--0-skip--1) [replicate(…)](#replicaten-x) [forever(…)](#foreverx) [iterate(…)](#iteratex-fn)
<br>**Object iterators** — [entries(…)](#entrieso) [keys(…)](#keyso) [values(…)](#valueso)
<br>**Utilities** — [is(…)](#ittisthing) [generator(…)](#ittgeneratorg)

[Iterator Methods](#iterator-methods)
<br>**Slicing** — [.slice](#slicestart--0-end--undefined) [.drop](#dropn) [.dropWhile](#dropwhilefn) [.dropLast](#droplastn) [.take](#taken) [.takeWhile](#takewhilefn) [.takeLast](#takelastn) [.tail](#tail) [.init](#init)
<br>**Transforming** — [.map](#mapfn) [.filter](#filterfn) [.reject](#rejectfn)
<br>**Querying** — [.first](#first) [.last](#last) [.pick](#picki) [.count](#count) [.every](#everyfn) [.some](#somefn)
<br>**Searching** — [.find](#findfn) [.findLast](#findlastfn) [.findIndex](#findindexfn) [.findLastIndex](#findlastindexfn) [.indexOf](#indexofx) [.lastIndexOf](#lastindexofx) [.includes](#includesx)
<br>**Manipulating** — [.enumerate](#enumerate) [.intersperse](#interspersesep) [.cycle](#cycle) [.unique](#unique) [.flatten](#flatten) [.chunksOf](#chunksofn) [.subsequences](#subsequencesn--1) [.lookahead](#lookaheadn--1)
<br>**Combining** — [.concat](#concatxs-) [.zip](#zipxs-) [.push](#pushx-) [.unshift](#unshiftx-)
<br>**Reducing** — [.reduce](#reducea-fn) [.inject](#injecta-fn) [.sum](#sum) [.product](#product) [.max](#max) [.min](#min) [.join](#joinsep--) [.groupBy](#groupbyfn-unique--false)
<br>**Conversion** — [.toArray](#toarray) [.toSet](#toset) [.toMap](#tomap) [.toObject](#toobjectempty--false)
<br>**Splitting** — [.split](#splitn--2)

## itt(thing), itt.from(thing)

Wraps an iterator. The wrapper is also iterable, and supports the methods listed [below](#iterator-methods). All functions and methods which return iterators automatically wrap them.

```js
itt(['foo', 'bar', 'baz', 'qux'])
  .filter(x => x.startsWith('b'))
  .map(x => x.toUpperCase())
  .toArray()
/* [ 'BAR', 'BAZ' ] */
```

**Note:** Many of the examples use `.toArray()` to show the elements of an iterator, but of course a feature of iterators is that they don't compute elements ahead of time (or even at all, depending on how they are iterated). For example, consider the following:

```js
const squares = itt.irange().map(x => {
  console.log('compute', x)
  return x * x
})
for (const y of squares.take(3)) {
  console.log('log', y)
}
/* 
compute 0
log 0
compute 1
log 1
compute 2
log 4
*/
```

## range([start = 0,] end, [skip = 1])

An iterator over an integer range from `start` (inclusive) to `end` (exclusive), incrementing or decrementing by `skip`.

```js
itt.range(5).map(x => x * x).toArray()
/* [ 0, 1, 4, 9, 16 ] */
```

## irange([start = 0, [skip = 1]])

An iterator over the integers starting at `start` and incrementing or decrementing by `skip`. Best paired with `.take()` or its variants.

```js
itt.irange().map(x => x * x).take(5).toArray()
/* [ 0, 1, 4, 9, 16 ] */
```

## replicate(n, x)

An iterator which yields `x` `n` times.

```js
itt.replicate(5, 0).toArray()
/* [ 0, 0, 0, 0, 0 ] */
```

## forever(x)

An iterator which yields `x` forever.

```js
itt.forever(0).take(5).toArray()
/* [ 0, 0, 0, 0, 0 ] */
```

## iterate(x, fn)

An iterator which yields `x`, `fn(x)`, `fn(fn(x))`, etc.

```js
itt.iterate(1, x => x * 2).take(5).toArray()
/* [ 1, 2, 4, 8, 16 ] */
```

## entries(o)

An iterator over the keys and values of an object.

```js
itt.entries({a: 1, b: 2}).toArray()
/* [ [ 'a', 1 ], [ 'b', 2 ] ] */

itt.entries({a: 1, b: 2, c: 3}).map(([k, v]) => [k, v * v]).toObject()
/* { a: 1, b: 4, c: 9 } */
```

## keys(o)

An iterator over the keys of an object.

```js
itt.keys({a: 1, b: 2, c: 3}).map(x => x.toUpperCase()).toArray()
/* [ 'A', 'B', 'C' ] */
```

## values(o)

An iterator over the values of an object.

```js
itt.values({a: 1, b: 2, c: 3}).map(x => x * x).toArray()
/* [ 1, 4, 9 ] */
```

# Iterator Methods

Methods can also be used statically by passing an iterator as the last argument. For example:

```js
itt.range(5).join() /* '0,1,2,3,4' */
itt.join(itt.range(5)) /* '0,1,2,3,4' */
```

## .join(sep = ',')

Stringifies and concatenates all values, separated by `sep`, like `Array.prototype.join`.

```js
itt.range(5).join() /* '0,1,2,3,4' */
```

## .intersperse(sep)

An iterator which yields `sep` between each element of this iterator.

```js
itt(['foo', 'bar', 'baz']).intersperse('or').toArray()
/* [ 'foo', 'or', 'bar', 'or', 'baz' ] */
```

## .cycle()

An iterator which yields the elements of this iterator, in order, cycled forever.

```js
itt.range(3).cycle().take(10).toArray()
/* [ 0, 1, 2, 0, 1, 2, 0, 1, 2, 0 ] */
```

**Note:** This method caches all elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

## .enumerate()

An iterator which yields pairs, each containing an index and element of this iterator.

```js
itt(['foo', 'bar', 'baz']).enumerate().toArray()
/* [ [ 0, 'foo' ], [ 1, 'bar' ], [ 2, 'baz' ] ] */
```

## .map(fn)

An iterator which yields `fn(x)` for each element `x` of this iterator.

```js
itt.range(5).map(x => x * x).toArray()
/* [ 0, 1, 4, 9, 16 ] */
```

## .filter(fn)

An iterator which yields the elements of this iterator for which `fn` returns a truthy value.

```js
itt([1, 5, 3, 2, 5, 9, 4, 95, 1, 4, 5, 2, 8]).filter(x => x % 2).toArray()
/* [ 1, 5, 3, 5, 9, 95, 1, 5 ] */
```

## .reject(fn)

An iterator which yields the elements of this iterator for which `fn` returns a falsey value.

```js
itt([1, 5, 3, 2, 5, 9, 4, 95, 1, 4, 5, 2, 8]).reject(x => x % 2).toArray()
/* [ 2, 4, 4, 2, 8 ] */
```

## .concat(xs, [...])

An iterator which yields the elements of this iterator, followed by the elements of `xs`, etc.

```js
itt.range(3).concat(itt.range(5), itt.range(3)).toArray()
/* [ 0, 1, 2, 0, 1, 2, 3, 4, 0, 1, 2 ] */
```

## .push(x, [...])

An iterator which yields the elements of this iterator, followed by `x`, etc.

```js
itt(['foo', 'bar']).push('baz', 'qux').toArray()
/* [ 'foo', 'bar', 'baz', 'qux' ] */
```

## .unshift(x, [...])

An iterator which yields `x`, etc., followed by the elements of this iterator.

```js
itt(['baz', 'qux']).unshift('foo', 'bar').toArray()
/* [ 'foo', 'bar', 'baz', 'qux' ] */
```

## .flatten()

An iterator which yields the elements of each element of this iterator. Each element must itself be iterable.

```js
itt([[1, 2, 3], [4, 5, 6]]).flatten().toArray()
/* [ 1, 2, 3, 4, 5, 6 ] */
```

## .chunksOf(n)

An iterator which yields arrays of `n` elements from this iterator, in sequence, without duplication. If there are not an even multiple of `n` elements in total, the last array is shorter.

```js
itt.range(10).chunksOf(3).toArray()
/* [ [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ], [ 9 ] ] */
```

## .subsequences(n = 2)

An iterator which yields each subsequence of `n` elements in this iterator. If there are fewer than `n` elements, yields nothing.

```js
itt.range(5).subsequences(3).toArray()
/* [ [ 0, 1, 2 ], [ 1, 2, 3 ], [ 2, 3, 4 ] ] */
itt.range(5).subsequences(6).toArray()
/* [] */
```

**Note:** This method caches at most `n-1` elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

## .lookahead(n = 1)

An iterator which yields arrays, each containing an element from this iterator and `n` elements of lookahead (or `undefined` if past the end of this iterator).

```js
for (const [here, next] of itt.range(5).lookahead()) {
  console.log(here, next)
}
0 1
1 2
2 3
3 4
4 undefined
```

**Note:** This method caches at most `n-1` elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

## .drop(n)

An iterator which yields all but the first `n` elements of this iterator.

```js
itt.range(10).drop(3).toArray()
/* [ 3, 4, 5, 6, 7, 8, 9 ] */
```

## .dropWhile(fn)

An iterator which skips elements of this iterator until `fn(x)` returns a falsey value for an element `x`, then yields `x` and every element after it.

```js
itt([1, 2, 3, 4, 5, 4, 3, 2, 1])
  .map(x => x * x)
  .dropWhile(x => x < 10)
  .toArray()
/* [ 16, 25, 16, 9, 4, 1 ] */
```

## .dropLast(n)

An iterator which yields all but the last `n` elements of this iterator.

```js
itt.range(10).dropLast(3).toArray()
/* [ 0, 1, 2, 3, 4, 5, 6 ] */
```

**Note:** This method caches at most `n` elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

## .take(n)

An iterator which yields the first `n` elements of this iterator.

```js
itt.irange().take(4).toArray()
/* [ 0, 1, 2, 3 ] */
```

## .takeWhile(fn)

An iterator which yields elements of this iterator until `fn(x)` returns a falsey value for an element `x`, then stops without yielding `x`.

```js
itt([1, 2, 3, 4, 5, 4, 3, 2, 1])
  .map(x => x * x)
  .takeWhile(x => x < 10)
  .toArray()
/* [ 1, 4, 9 ] */
```

## .takeLast(n)

An iterator which yields the last `n` elements of this iterator. If this iterator yields fewer than `n` elements, it yields all available elements.

```js
itt.range(10).takeLast(3).toArray()
/* [ 7, 8, 9 ] */
```

**Note:** This method caches at most `n` elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

## .zip(xs, [...])

An iterator which yields arrays containing one element from this iterator and one element from each argument iterator, stopping when any iterator is done.

```js
itt.irange().zip(['a', 'b', 'c']).toArray()
/* [ [ 0, 'a' ], [ 1, 'b' ], [ 2, 'c' ] ] */
```

## .every(fn)

True if `fn(x)` returns a truthy value for every element `x` of this iterator.

```js
itt(['foo', 'bar', 'baz']).every(x => x.startsWith('b'))
/* false */

itt.range(3).map(x => x * x).every(x => x < 10)
/* true */
```

## .some(fn)

True if `fn(x)` returns a truthy value for any element `x` of this iterator.

```js
itt(['foo', 'bar', 'baz']).some(x => x.startsWith('b'))
/* true */

itt.range(3).map(x => x * x).some(x => x > 10)
/* false */
```

## .find(fn)

The first element of this iterator for which `fn` returns a truthy value, or `undefined` if none exists.

```js
itt.range(10).map(x => x * x).find(x => x > 10)
/* 16 */

itt.range(10).map(x => x * x).find(x => x > 100)
/* undefined */
```

## .findLast(fn)

The last element of this iterator for which `fn` returns a truthy value, or `undefined` if none exists.

```js
itt.range(10).map(x => x * x).find(x => x > 10)
/* 81 */

itt.range(10).map(x => x * x).find(x => x > 100)
/* undefined */
```

## .findIndex(fn)

The 0-based index of the first element of this iterator for which `fn` returns a truthy value, or -1 if none exists.

```js
itt.range(10).map(x => x * x).findIndex(x => x > 10)
/* 4 */

itt.range(10).map(x => x * x).findIndex(x => x > 100)
/* -1 */
```

## .findLastIndex(fn)

The 0-based index of the last element of this iterator for which `fn` returns a truthy value, or -1 if none exists.

```js
itt.range(10).map(x => x * x).findLastIndex(x => x > 10)
/* 9 */

itt.range(10).map(x => x * x).findLastIndex(x => x > 100)
/* -1 */
```

## .indexOf(x)

The 0-based index of the first element of this iterator which is strictly equal (`===`) to `x`, or -1 if none exists.

```js
itt(['foo', 'bar', 'baz', 'bar', 'foo'])
  .map(x => x.toUpperCase())
  .indexOf('BAR')
/* 1 */
```


## .lastIndexOf(x)

The 0-based index of the last element of this iterator which is strictly equal (`===`) to `x`, or -1 if none exists.

```js
itt(['foo', 'bar', 'baz', 'bar', 'foo'])
  .map(x => x.toUpperCase())
  .lastIndexOf('BAR')
/* 3 */
```

## .includes(x)

True if any element of this iterator is strictly equal (`===`) to `x`.

```js
itt.range(10).map(x => x * x).includes(16)
/* true */

itt.range(10).map(x => x * x).includes(5)
/* false */
```

## .reduce(a, fn)

Accumulates `a = fn(a, x)` for each element of this iterator, in iteration order.

```js
itt.range(6).reduce(0, (x, y) => x + y)
/* 15 */
```

## .inject(a, fn)

Calls `fn(a, x)` for each element of this iterator, in iteration order, then returns `a`.

```js
itt(['foo', 'bar', 'baz']).inject({}, (a, x) => a[x] = true)
/* { foo: true, bar: true, baz: true } */
```

## .first()
**.head() [alias]**

The first element of this iterator.

```js
itt.irange().map(x => x * x).drop(5).first()
/* 25 */
```

## .last()

The last element of this iterator.

```js
itt.range(10).map(x => x * x).last()
/* 81 */
```

## .tail()

An iterator which yields all but the first element of this iterator.

```js
itt.range(10).map(x => x * x).tail().toArray()
/* [ 1, 4, 9, 16, 25, 36, 49, 64, 81 ] */
```

## .init()

An iterator which yields all but the last element of this iterator.

```js
itt.range(10).map(x => x * x).init().toArray()
/* [ 0, 1, 4, 9, 16, 25, 36, 49, 64 ] */
```

## .count()

The number of elements in this iterator

```js
itt.range(10).filter(x => x % 2).count()
/* 5 */
```

## .pick(i)

The `i`th element of this iterator

```js
itt.irange().map(x => x * x).pick(3)
/* 9 */
```

## .sum()

The sum of the elements of this iterator.

```js
itt.range(6).sum()
/* 15 */
```

## .product()

The product of the elements of this iterator.

```js
itt.range(1, 6).product()
/* 120 */
```

## .max()

The maximum element of this iterator.

```js
itt([6, 1, 4, 9, 3, 7]).map(x => x * x).max()
/* 81 */
```

## .min()

The minimum element of this iterator.

```js
itt([6, 1, 4, 9, 3, 7]).map(x => x * x).min()
/* 1 */
```

## .groupBy(fn, [unique = false])

Calls `fn(x)` for each element of this iterator and returns a map from return values of `fn` to arrays of elements. If `unique` is true, use sets instead of arrays. (If `fn` is a pure function, this is equivalent to `.unique().groupBy(fn)`)

```js
itt.range(10).groupBy(x => x % 3)
/* Map { 0 => [ 0, 3, 6, 9 ], 1 => [ 1, 4, 7 ], 2 => [ 2, 5, 8 ] } */

itt([1, 4, 7, 6, 4, 6, 5, 2, 1, 0, 9, 7]).groupBy(x => x % 3, true)
/* Map { 1 => Set { 1, 4, 7 }, 0 => Set { 6, 0, 9 }, 2 => Set { 5, 2 } } */
```

## .unique()

An iterator which yields elements of this iterator and skips elements which are strictly equal to any that have already appeared.

```js
itt([1, 4, 7, 6, 4, 6, 5, 2, 1, 0, 9, 7]).unique().toArray()
/* [ 1, 4, 7, 6, 5, 2, 0, 9 ] */
```

## .slice([start = 0, [end = undefined]])

Like `Array.prototype.slice`. Returns an iterator which yields a subsequence of the elements of this iterator, starting at the `start`th element (inclusive) and ending at the `end`th element (exclusive).

If an index is negative, that index is treated as an index from the end of the iterator. If `end` is missing, it is treated as if it were the number of elements in this iterator.

```js
itt.range(10).map(x => x * x).slice(1, 4).toArray()
/* [ 1, 4, 9 ] */

itt.range(10).map(x => x * x).slice(1, -1).toArray()
/* [ 1, 4, 9, 16, 25, 36, 49, 64 ] */

itt.range(10).map(x => x * x).slice(-3).toArray()
/* [ 49, 64, 81 ] */
```

## .split(n = 2)

An array of `n` iterators which all yield every element of this iterator in sequence.

```js
const [a, b] = itt.range(5).split()
itt.zip(
  a.map(x => x * x),
  b.map(x => x * x * x)).toArray()
/* [ [ 0, 0 ], [ 1, 1 ], [ 4, 8 ], [ 9, 27 ], [ 16, 64 ] ] */
```

**Note:** This method caches some elements of this iterator. As any derived iterator advances, new elements are cached, and once every derived iterator has been iterated past an element, that element is discarded.

## .toArray()
**.array() [alias]**

An array of the elements in this iterator. Equivalent to `Array.from(this)`.

```js
itt.range(5).toArray()
/* [ 0, 1, 2, 3, 4 ] */
```

## .toSet()

A Set of the elements in this iterator. Equivalent to `new Set(this)`.

```js
itt.range(5).toSet()
/* Set { 0, 1, 2, 3, 4 } */
```

## .toMap()

A Map of the key-value pairs in this iterator. Equivalent to `new Map(this)`.

```js
const m = new Map
m.set('a', 1)
m.set('b', 2)
m.set('c', 3)
itt(m).map(([k, v]) => [k + '!', v * v]).toMap()
/* Map { 'a!' => 1, 'b!' => 4, 'c!' => 9 } */
```

## .toObject(empty = false)

An object containing the key-value pairs in this iterator. If `empty` is true, starts with `Object.create(null)` instead of `{}`.

```js
itt(['foo', 'bar', 'baz']).map(s => [s, s.toUpperCase()]).toObject()
/* { foo: 'FOO', bar: 'BAR', baz: 'BAZ' } */
```

# Utilities

## itt.is(thing)

True if `thing` is iterable or an iterator.

```js
itt.is(1) // false
iit.is('test') // true
itt.is('test'[Symbol.iterator]()) // true
itt.is(itt.range(5)) // true
```

## itt.generator(g)

Takes a generator function and returns a generator function which returns wrapped iterators.

```js
const fn = itt.generator(function*(...xs) {
  yield* xs
  xs.pop()
  xs.reverse()
  yield* xs
})
fn(1, 2, 3).map(x => x * x).toArray()
/* [ 1, 4, 9, 4, 1 ] */
```