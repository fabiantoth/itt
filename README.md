# itt

Iteration tools.

```js
function primes() {
  const seen = new Set
  return itt.irange(2)
    .filter(p => itt(seen).every(n => p % n !== 0))
    .tap(p => seen.add(p))
}

console.log(
  itt(primes())
  .takeWhile(x => x < 1000)
  .map(x => `${x} is prime!`)
  .join('\n'))

/*
2 is prime!
3 is prime!
5 is prime!
7 is prime!
11 is prime!
...
983 is prime!
991 is prime!
997 is prime!
*/

fs.readFile('.git/index', (err, buf) => {
  if (err) return
  console.log(
    itt(buf)
    .take(256)
    .chunksOf(16)
    .map(ch => itt(ch)
      .map(c => c.toString(16).padStart(2, '0'))
      .push(itt(ch).map(c => c < 32 || c > 0x7f ? '·' : String.fromCharCode(c)).join(''))
      .join(' '))
    .join('\n'))
})


/*
44 49 52 43 00 00 00 02 00 00 00 09 5c 40 e5 3b DIRC········\@·;
11 15 60 c3 5c 40 e5 3b 11 15 60 c3 01 00 00 04 ··`·\@·;··`·····
00 30 13 ba 00 00 81 a4 00 00 01 f5 00 00 00 14 ·0··············
00 00 00 2b a2 65 2f d5 ac 16 9c 99 f3 c3 ae de ···+·e/·········
7c 77 23 d4 cf 3f 99 ee 00 0a 2e 67 69 74 69 67 |w#··?····.gitig
6e 6f 72 65 00 00 00 00 00 00 00 00 5a 72 89 93 nore········Zr··
19 23 60 b4 5a 55 1e 9c 00 00 00 00 01 00 00 04 ·#`·ZU··········
00 0e 4a 91 00 00 81 a4 00 00 01 f5 00 00 00 14 ··J·············
00 00 04 16 c7 39 ef 67 ea 2f 0f 44 c3 57 8c 2d ·····9·g·/·D·W·-
18 63 20 e0 59 0f 3c c8 00 0a 4c 49 43 45 4e 53 ·c ·Y·<···LICENS
45 2e 6d 64 00 00 00 00 00 00 00 00 5c 40 f2 a7 E.md········\@··
26 5a ae 86 5c 40 f2 a7 26 5a ae 86 01 00 00 04 &Z··\@··&Z······
00 0e 61 56 00 00 81 a4 00 00 01 f5 00 00 00 14 ··aV············
00 00 5f 85 b8 1e 2f 42 77 ff fb 10 4e 89 af 1a ··_···/Bw···N···
4c ea b7 31 44 40 14 d3 00 09 52 45 41 44 4d 45 L··1D@····README
2e 6d 64 00 5c 40 f1 7c 0c 90 c6 ac 5c 40 f1 7c .md·\@·|····\@·|
*/

```

# Install

```sh
$ npm i itt
```

# Use

```js
const itt = require('itt')
```

# API

**[Constructors](#constructors)** — [from(…)](#ittthing-ittfromthing) [empty()](#empty) [range(…)](#rangestart--0-end-skip--1) [irange(…)](#irangestart--0-skip--1) [replicate(…)](#replicaten-x) [forever(…)](#foreverx) [iterate(…)](#iteratex-fn) [split(…)](#splitstring-sep--undefined-limit--infinity)
<br>**[Object iterators](#object-iterators)** — [entries(…)](#entrieso) [keys(…)](#keyso) [values(…)](#valueso)
<br>**[Utilities](#utilities)** — [is(…)](#ittisthing) [generator(…)](#ittgeneratorg)

**[Iterator Methods](#iterator-methods)**
<br>**[Slicing](#slicing)** — [.slice](#slicestart--0-end--undefined) [.drop](#dropn) [.dropWhile](#dropwhilefn) [.dropLast](#droplastn) [.take](#taken) [.takeWhile](#takewhilefn) [.takeLast](#takelastn) [.tail](#tail) [.init](#init)
<br>**[Transforming](#transforming)** — [.map](#mapfn) [.flatMap](#flatmapfn) [.filter](#filterfn) [.reject](#rejectfn) [.scan](#scana-fn) [.scan1](#scan1fn)
<br>**[Querying](#querying)** — [.first](#first) [.last](#last) [.pick](#picki) [.count](#count) [.every](#everyfn) [.some](#somefn) [.tap](#tapfn)
<br>**[Searching](#searching)** — [.detect](#detectfn) [.find](#findfn--id) [.findLast](#findlastfn--id) [.findIndex](#findindexfn--id) [.findLastIndex](#findlastindexfn--id) [.indexOf](#indexofx) [.lastIndexOf](#lastindexofx) [.includes](#includesx)
<br>**[Combinatorics](#combinatorics)** — [.cartesianProduct](#cartesianproductxs-) [.permutations](#permutationsn--undefined) [.combinations](#combinationsn--undefined)
<br>**[Manipulating](#manipulating)** — [.enumerate](#enumerate) [.intersperse](#interspersesep) [.cycle](#cycle) [.repeat](#repeatn) [.unique](#unique) [.flatten](#flatten) [.chunksOf](#chunksofn--2) [.chunksBy](#chunksbyfn) [.subsequences](#subsequencesn--2) [.lookahead](#lookaheadn--1) [.transpose](#transpose)
<br>**[Combining](#combining)** — [.concat](#concatxs-) [.zip](#zipxs-) [.parallel](#parallelxs-) [.push](#pushx-) [.unshift](#unshiftx-)
<br>**[Reducing](#reducing)** — [.reduce](#reducea-fn) [.reduce1](#reduce1fn) [.inject](#injecta-fn) [.sum](#sum) [.mean](#mean) [.product](#product) [.max](#max) [.min](#min) [.minMax](#minmax) [.join](#joinsep--) [.groupBy](#groupbyfn-unique--false) [.keyBy](#keybyfn) [.forEach](#foreachfn) [.drain](#drain)
<br>**[Conversion](#conversion)** — [.toArray](#toarray) [.toSet](#toset) [.toMap](#tomap) [.toObject](#toobjectempty--false)
<br>**[Forking](#forking)** — [.fork](#forkn--2)

## Constructors
### itt(thing), itt.from(thing)

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

### empty()

An iterator which yields no values.

```js
itt.empty().toArray()
/* [] */
```

### range([start = 0,] end, [skip = 1])

An iterator over an integer range from `start` (inclusive) to `end` (exclusive), incrementing or decrementing by `skip`.

```js
itt.range(5).map(x => x * x).toArray()
/* [ 0, 1, 4, 9, 16 ] */
```

### irange([start = 0, [skip = 1]])

An iterator over the integers starting at `start` and incrementing or decrementing by `skip`. Best paired with `.take` or its variants.

```js
itt.irange().map(x => x * x).take(5).toArray()
/* [ 0, 1, 4, 9, 16 ] */
```

### replicate(n, x)

An iterator which yields `x` `n` times.

```js
itt.replicate(5, 0).toArray()
/* [ 0, 0, 0, 0, 0 ] */
```

### forever(x)

An iterator which yields `x` forever.

```js
itt.forever(0).take(5).toArray()
/* [ 0, 0, 0, 0, 0 ] */
```

### iterate(x, fn)

An iterator which yields `x`, `fn(x)`, `fn(fn(x))`, etc.

```js
itt.iterate(1, x => x * 2).take(5).toArray()
/* [ 1, 2, 4, 8, 16 ] */
```

### split(string, [sep = undefined, [limit = Infinity]])

An iterator which yields slices of `string`, delimited by `sep`, up to a maximum of `limit` items. Just like the built-in `String.prototype.split`, but does not create an intermediate array.

```js
itt.split('one,two,three,four,five', ',').toArray()
/* ['one', 'two', 'three', 'four', 'five'] */
itt.split('one<a>two<b>three<c>four', /<(\w+)>/).toArray()
/* ['one', 'c', 'two', 'b', 'three', 'c', 'four'] */
```

## Object iterators

### entries(o)

An iterator over the keys and values of an object.

```js
itt.entries({a: 1, b: 2}).toArray()
/* [ [ 'a', 1 ], [ 'b', 2 ] ] */

itt.entries({a: 1, b: 2, c: 3}).map(([k, v]) => [k, v * v]).toObject()
/* { a: 1, b: 4, c: 9 } */
```

### keys(o)

An iterator over the keys of an object.

```js
itt.keys({a: 1, b: 2, c: 3}).map(x => x.toUpperCase()).toArray()
/* [ 'A', 'B', 'C' ] */
```

### values(o)

An iterator over the values of an object.

```js
itt.values({a: 1, b: 2, c: 3}).map(x => x * x).toArray()
/* [ 1, 4, 9 ] */
```

## Utilities

### itt.is(thing)

True if `thing` is iterable or an iterator.

```js
itt.is(1) // false
itt.is('test') // true
itt.is('test'[Symbol.iterator]()) // true
itt.is(itt.range(5)) // true
```

### itt.generator(g)

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

# Iterator Methods

Methods can also be used statically by passing an iterator as the last argument. For example:

```js
itt.range(10).filter(a => a % 2).join() /* '1,3,5,7,9' */
itt.join(itt.filter(a => a % 2, itt.range(10))) /* '1,3,5,7,9' */
```

## Slicing

### .slice([start = 0, [end = undefined]])

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

### .drop(n)

An iterator which yields all but the first `n` elements of this iterator.

```js
itt.range(10).drop(3).toArray()
/* [ 3, 4, 5, 6, 7, 8, 9 ] */
```

### .dropWhile(fn)

An iterator which skips elements of this iterator until `fn(x)` returns a falsey value for an element `x`, then yields `x` and every element after it.

```js
itt([1, 2, 3, 4, 5, 4, 3, 2, 1])
  .map(x => x * x)
  .dropWhile(x => x < 10)
  .toArray()
/* [ 16, 25, 16, 9, 4, 1 ] */
```

### .dropLast(n)

An iterator which yields all but the last `n` elements of this iterator.

```js
itt.range(10).dropLast(3).toArray()
/* [ 0, 1, 2, 3, 4, 5, 6 ] */
```

**Note:** This method caches at most `n` elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

### .take(n)

An iterator which yields the first `n` elements of this iterator.

```js
itt.irange().take(4).toArray()
/* [ 0, 1, 2, 3 ] */
```

### .takeWhile(fn)

An iterator which yields elements of this iterator until `fn(x)` returns a falsey value for an element `x`, then stops without yielding `x`.

```js
itt([1, 2, 3, 4, 5, 4, 3, 2, 1])
  .map(x => x * x)
  .takeWhile(x => x < 10)
  .toArray()
/* [ 1, 4, 9 ] */
```

### .takeLast(n)

An iterator which yields the last `n` elements of this iterator. If this iterator yields fewer than `n` elements, it yields all available elements.

```js
itt.range(10).takeLast(3).toArray()
/* [ 7, 8, 9 ] */
```

**Note:** This method caches at most `n` elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

### .tail()

An iterator which yields all but the first element of this iterator.

```js
itt.range(10).map(x => x * x).tail().toArray()
/* [ 1, 4, 9, 16, 25, 36, 49, 64, 81 ] */
```

### .init()

An iterator which yields all but the last element of this iterator.

```js
itt.range(10).map(x => x * x).init().toArray()
/* [ 0, 1, 4, 9, 16, 25, 36, 49, 64 ] */
```

## Transforming

### .map(fn)

An iterator which yields `fn(x)` for each element `x` of this iterator.

```js
itt.range(5).map(x => x * x).toArray()
/* [ 0, 1, 4, 9, 16 ] */
```

### .flatMap(fn)

An iterator which yields the elements of `fn(x)` for each element `x` of this iterator. Equivalent to `.map(fn).flatten()`.

```js
itt.range(5).flatMap(x => [x, x * x]).toArray()
/* [ 0, 0, 1, 1, 2, 4, 3, 9, 4, 16 ] */
```

### .filter(fn)

An iterator which yields the elements of this iterator for which `fn` returns a truthy value.

```js
itt([1, 5, 3, 2, 5, 9, 4, 95, 1, 4, 5, 2, 8]).filter(x => x % 2).toArray()
/* [ 1, 5, 3, 5, 9, 95, 1, 5 ] */
```

### .reject(fn)

An iterator which yields the elements of this iterator for which `fn` returns a falsey value.

```js
itt([1, 5, 3, 2, 5, 9, 4, 95, 1, 4, 5, 2, 8]).reject(x => x % 2).toArray()
/* [ 2, 4, 4, 2, 8 ] */
```

### .partition(fn)

A pair of iterators. The first yields the elements of this iterator for which `fn` returns a truthy value, and the second yields the elements for which it returns a falsey value.

```js
const [a, b] = itt([1, 5, 3, 2, 5, 9, 4, 95, 1, 4, 5, 2]).partition(x => x % 2)
a.toArray() // [ 1, 5, 3, 5, 9, 95, 1, 5 ]
b.toArray() // [ 2, 4, 4, 2 ]
```

### .scan(a, fn)

Accumulates `a = fn(a, x)` for each element of this iterator, in iteration order, and yields each intermediate result. The resultant iterator always yields the same number of elements as this iterator.

```js
itt.irange().scan(0, (x, y) => x + y).take(5).toArray()
/* [ 0, 1, 3, 6, 10 ] */
```

### .scan1(fn)

Like `.scan`, but draws (and yields) the initial value of `a` from the first element of this iterator, accumulating `a = fn(a, x)` for each subsequent element. The resultant iterator always yields the same number of elements as this iterator.

```js
itt.irange().scan1((x, y) => x + y).take(5).toArray()
/* [ 0, 1, 3, 6, 10 ] */
```

## Querying

### .first()
**.head() [alias]**

The first element of this iterator, or `undefined` if this iterator is empty.

```js
itt.irange().map(x => x * x).drop(5).first()
/* 25 */
```

### .last()

The last element of this iterator, or `undefined` if this iterator is empty.

```js
itt.range(10).map(x => x * x).last()
/* 81 */
```

### .pick(i)

The `i`th element of this iterator, or `undefined` if it does not exist.

```js
itt.irange().map(x => x * x).pick(3)
/* 9 */
```

### .count()

The number of elements in this iterator.

```js
itt.range(10).filter(x => x % 2).count()
/* 5 */
```

### .every(fn)

True if `fn(x)` returns a truthy value for every element `x` of this iterator.

```js
itt(['foo', 'bar', 'baz']).every(x => x.startsWith('b'))
/* false */

itt.range(3).map(x => x * x).every(x => x < 10)
/* true */
```

### .some(fn)

True if `fn(x)` returns a truthy value for any element `x` of this iterator.

```js
itt(['foo', 'bar', 'baz']).some(x => x.startsWith('b'))
/* true */

itt.range(3).map(x => x * x).some(x => x > 10)
/* false */
```

### .tap(fn)

An iterator which yields each element `x` of this iterator after calling `fn(x)`. Useful for inspecting intermediate iterators with `console.log` and for running iterators through side-effectful functions.

```js
const alnum = itt.range(0x21, 0x7f)
  .map(String.fromCharCode)
  .filter(s => /\w/.test(s))
  .tap(console.log)
console.log('total: %d', alnum.count())
/*
0
1
2
...
x
y
z
total: 63
*/
```

## Searching

### .detect(fn)

Applies `fn` to each element and returns the first truthy result, or `undefined` if none exists. Equivalent to `.map(fn).find()`.

```js
itt(['bananas', 'oranges', 'blueberries', 'pears', 'apples'])
  .detect(x => x.match(/(\w)\1/g))
/* [ 'rr' ] */

const people = [
  {name: 'Olivia'},
  {name: 'Emily', favoriteBook: 'The Grapes of Wrath'},
  {name: 'Jessica', favoriteBook: 'The Sun Also Rises'},
]
itt(people).detect(x => x.favoriteBook)
/* 'The Grapes of Wrath' */
itt(people).detect(x => x.vehicle)
/* undefined */
```

### .find([fn = undefined])

The first element of this iterator for which `fn` returns a truthy value (if `fn` is undefined, the first truthy element of this iterator), or `undefined` if none exists.

```js
itt.range(10).map(x => x * x).find(x => x > 10)
/* 16 */

itt.range(10).map(x => x * x).find(x => x > 100)
/* undefined */
```

### .findLast([fn = undefined])

The last element of this iterator for which `fn` returns a truthy value (if `fn` is undefined, the last truthy element of this iterator), or `undefined` if none exists.

```js
itt.range(10).map(x => x * x).find(x => x > 10)
/* 81 */

itt.range(10).map(x => x * x).find(x => x > 100)
/* undefined */
```

### .findIndex([fn = undefined])

The 0-based index of the first element of this iterator for which `fn` returns a truthy value (if `fn` is undefined, the first truthy element of this iterator), or -1 if none exists.

```js
itt.range(10).map(x => x * x).findIndex(x => x > 10)
/* 4 */

itt.range(10).map(x => x * x).findIndex(x => x > 100)
/* -1 */
```

### .findLastIndex([fn = undefined])

The 0-based index of the last element of this iterator for which `fn` returns a truthy value (if `fn` is undefined, the last truthy element of this iterator), or -1 if none exists.

```js
itt.range(10).map(x => x * x).findLastIndex(x => x > 10)
/* 9 */

itt.range(10).map(x => x * x).findLastIndex(x => x > 100)
/* -1 */
```

### .indexOf(x)

The 0-based index of the first element of this iterator which is strictly equal (`===`) to `x`, or -1 if none exists.

```js
itt(['foo', 'bar', 'baz', 'bar', 'foo'])
  .map(x => x.toUpperCase())
  .indexOf('BAR')
/* 1 */
```

### .lastIndexOf(x)

The 0-based index of the last element of this iterator which is strictly equal (`===`) to `x`, or -1 if none exists.

```js
itt(['foo', 'bar', 'baz', 'bar', 'foo'])
  .map(x => x.toUpperCase())
  .lastIndexOf('BAR')
/* 3 */
```

### .includes(x)

True if any element of this iterator is strictly equal (`===`) to `x`.

```js
itt.range(10).map(x => x * x).includes(16)
/* true */

itt.range(10).map(x => x * x).includes(5)
/* false */
```

## Combinatorics

### .cartesianProduct(xs, [...])

An iterator of elements in the Cartesian product of the arguments.

```js
itt.cartesianProduct(['A', 'B', 'C'], ['D', 'E', 'F'])
  .map(a => a.join(''))
  .toArray()
/* [ 'AD', 'AE', 'AF', 'BD', 'BE', 'BF', 'CD', 'CE', 'CF' ] */
```

**Note:** This method can be called statically with any number of arguments, and yields arrays in argument order.

```js
itt(['A', 'B', 'C']).cartesianProduct(['D', 'E', 'F'])
  .map(a => a.join(''))
  .toArray()
/* [ 'AD', 'AE', 'AF', 'BD', 'BE', 'BF', 'CD', 'CE', 'CF' ] */
```

#### .cartesianProduct([n = 1])

An iterator of elements in the Cartesian product `this`<sup>`n`</sup>, i.e., the Cartesian product of `n` copies of this iterator.

```js
itt([0, 1]).cartesianProduct(3).map(a => a.join('')).toArray()
/* [ '000', '001', '010', '011', '100', '101', '110', '111' ] */
```

### .permutations([n = undefined])

An iterator of all permutations of elements of this iterator of length `n`, or of the same length as this iterator if `n` is undefined.

```js
itt('ABC').permutations().map(s => s.join('')).toArray()
/* [ 'ABC', 'ACB', 'BCA', 'BAC', 'CAB', 'CBA' ] */

itt('ABC').permutations(2).map(s => s.join('')).toArray()
/* [ 'AB', 'AC', 'BC', 'BA', 'CA', 'CB' ] */
```

### .combinations([n = undefined])

An iterator of all combinations of elements of this iterator of length `n` in iteration order, or of the same length as this iterator if `n` is undefined.

```js
itt('ABCDE').combinations(3).map(s => s.join('')).toArray()
/* [ 'ABC', 'ABD', 'ABE', 'ACD', 'ACE', 'ADE', 'BCD', 'BCE', 'BDE', 'CDE' ] */
```

## Manipulating

### .enumerate()

An iterator which yields pairs, each containing a 0-based index and element of this iterator.

```js
itt(['foo', 'bar', 'baz']).enumerate().toArray()
/* [ [ 0, 'foo' ], [ 1, 'bar' ], [ 2, 'baz' ] ] */
```

### .intersperse(sep)

An iterator which yields `sep` between each element of this iterator.

```js
itt(['foo', 'bar', 'baz']).intersperse('or').toArray()
/* [ 'foo', 'or', 'bar', 'or', 'baz' ] */
```

### .cycle()

An iterator which yields the elements of this iterator, in order, cycled forever.

```js
itt.range(3).cycle().take(10).toArray()
/* [ 0, 1, 2, 0, 1, 2, 0, 1, 2, 0 ] */
```

**Note:** This method caches all elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

### .repeat(n)

An iterator which yields the elements of this iterator, in order, cycled `n` times.

```js
itt.range(3).repeat(3).toArray()
/* [ 0, 1, 2, 0, 1, 2, 0, 1, 2 ] */
```

**Note:** This method caches all elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

### .unique()

An iterator which yields elements of this iterator and skips elements which are `Set`-membership-equal to any that have already appeared.

```js
itt([1, 4, 7, 6, 4, 6, 5, 2, 1, 0, 9, 7]).unique().toArray()
/* [ 1, 4, 7, 6, 5, 2, 0, 9 ] */
```

**Note:** This method caches all elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

### .flatten()

An iterator which yields the elements of each element of this iterator. Each element must itself be iterable.

```js
itt([[1, 2, 3], [4, 5, 6]]).flatten().toArray()
/* [ 1, 2, 3, 4, 5, 6 ] */
```

### .chunksOf(n = 2)

An iterator which yields arrays of `n` elements from this iterator, in sequence, without duplication. If there are not an even multiple of `n` elements in total, the last array is shorter.

```js
itt.range(10).chunksOf(3).toArray()
/* [ [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ], [ 9 ] ] */
```

### .chunksBy(fn)

An iterator which yields arrays of elements from this iterator, in sequence, without duplication. Each array is extended with the next element from this iterator until `fn(newEl, prevEl, currentArray)` returns false.

```js
const sameParity = (x, y) => x % 2 === y % 2
itt([1, 3, 5, 7, 2, 4, 6, 9, 13]).chunksBy(sameParity).toArray()
/* [ [ 1, 3, 5, 7 ], [ 2, 4, 6 ], [ 9, 13 ] ] */

itt.range(10).chunksBy((a, b, xs) => xs.length < 3).toArray()
/* [ [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ], [ 9 ] ] */
```

### .subsequences(n = 2)

An iterator which yields each subsequence of `n` elements in this iterator. If there are fewer than `n` elements, yields nothing.

```js
itt.range(5).subsequences(3).toArray()
/* [ [ 0, 1, 2 ], [ 1, 2, 3 ], [ 2, 3, 4 ] ] */
itt.range(5).subsequences(6).toArray()
/* [] */
```

**Note:** This method caches at most `n` elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

### .lookahead(n = 1)

An iterator which yields arrays, each containing an element from this iterator and `n` elements of lookahead (or `undefined` if past the end of this iterator).

```js
for (const [here, next] of itt.range(5).lookahead()) {
  console.log(here, next)
}
/*
0 1
1 2
2 3
3 4
4 undefined
*/
```

**Note:** This method caches at most `n` elements of this iterator. It does not pull elements from this iterator, however, until its return value is iterated.

### .transpose()

An iterator which yields arrays of elements at sequential indices in each element of this iterator, whose elements must be iterable. Equivalent to `zip(...this)`.

```js
itt([[1, 2, 3], [4, 5, 6], [7, 8, 9, 10]]).transpose().toArray()
/* [ [ 1, 4, 7 ], [ 2, 5, 8 ], [ 3, 6, 9 ] ] */
```

## Combining

### .concat(xs, [...])

An iterator which yields the elements of this iterator, followed by the elements of `xs`, etc.

```js
itt.range(3).concat(itt.range(5), itt.range(3)).toArray()
/* [ 0, 1, 2, 0, 1, 2, 3, 4, 0, 1, 2 ] */
```

**Note:** This method can be called statically with any number of arguments, and yields elements in argument order.

```js
itt.concat([1, 2, 3], [4, 5, 6], [7, 8, 9]).toArray()
/* [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ] */
```

### .zip(xs, [...])

An iterator which yields arrays containing one element from this iterator and one element from each argument iterator, stopping when any iterator is done.

```js
itt.irange().zip(['a', 'b', 'c']).toArray()
/* [ [ 0, 'a' ], [ 1, 'b' ], [ 2, 'c' ] ] */
```

**Note:** This method can be called statically with any number of arguments, and yields arrays in argument order.

```js
itt.zip([1, 2, 3], [4, 5, 6], [7, 8, 9]).toArray()
/* [ [ 1, 4, 7 ], [ 2, 5, 8 ], [ 3, 6, 9 ] ] */
```

### .parallel(xs, [...])

An iterator which yields arrays containing one element from this iterator and one element from each argument iterator, stopping when all iterators are done.

```js
itt.range(5).parallel(['a', 'b', 'c']).toArray()
/* [ [ 0, 'a' ],
  [ 1, 'b' ],
  [ 2, 'c' ],
  [ 3, undefined ],
  [ 4, undefined ] ] */
```

**Note:** This method can be called statically with any number of arguments, and yields arrays in argument order.

```js
itt.parallel([1, 2, 3], [4, 5, 6], [7, 8, 9]).toArray()
/* [ [ 1, 4, 7 ], [ 2, 5, 8 ], [ 3, 6, 9 ] ] */
```

### .push(x, [...])

An iterator which yields the elements of this iterator, followed by `x`, etc.

```js
itt(['foo', 'bar']).push('baz', 'qux').toArray()
/* [ 'foo', 'bar', 'baz', 'qux' ] */
```

### .unshift(x, [...])

An iterator which yields `x`, etc., followed by the elements of this iterator.

```js
itt(['baz', 'qux']).unshift('foo', 'bar').toArray()
/* [ 'foo', 'bar', 'baz', 'qux' ] */
```

## Reducing

### .reduce(a, fn)

Accumulates `a = fn(a, x)` for each element of this iterator, in iteration order, then returns `a`.

```js
itt.range(6).reduce(0, (x, y) => x + y)
/* 15 */
```

### .reduce1(fn)

Like `.reduce`, but draws the initial value of `a` from the first element of this iterator, accumulating `a = fn(a, x)` for each subsequent element and then returning `a`. Returns `undefined` if this iterator is empty.

```js
itt.range(6).reduce1((x, y) => x + y)
/* 15 */
```

### .inject(a, fn)

Calls `fn(a, x)` for each element of this iterator, in iteration order, then returns `a`.

```js
itt(['foo', 'bar', 'baz']).inject({}, (a, x) => a[x] = true)
/* { foo: true, bar: true, baz: true } */
```

### .sum()

The sum of the elements of this iterator.

```js
itt.range(6).sum()
/* 15 */
```

### .mean()

The arithmetic mean of the elements of this iterator. Returns `NaN` if this iterator has no elements.

```js
itt.range(6).mean()
/* 2.5 */
```

### .product()

The product of the elements of this iterator.

```js
itt.range(1, 6).product()
/* 120 */
```

### .max()

The maximum element of this iterator.

```js
itt([6, 1, 4, 9, 3, 7]).map(x => x * x).max()
/* 81 */
```

### .min()

The minimum element of this iterator.

```js
itt([6, 1, 4, 9, 3, 7]).map(x => x * x).min()
/* 1 */
```

### .minMax()

The minimum and maximum elements of this iterator as a pair `[min, max]`.

```js
itt([6, 1, 4, 9, 3, 7]).map(x => x * x).minMax()
/* [1, 81] */
```

### .join(sep = ',')

Stringifies and concatenates all values, separated by `sep`, like `Array.prototype.join`.

```js
itt.range(5).join() /* '0,1,2,3,4' */
```

### .groupBy(fn, [unique = false])

Calls `fn(x)` for each element of this iterator and returns a map from return values of `fn` to arrays of elements. If `unique` is true, use sets instead of arrays. (If `fn` is a pure function, this is equivalent to `.unique().groupBy(fn)`)

```js
itt.range(10).groupBy(x => x % 3)
/* Map { 0 => [ 0, 3, 6, 9 ], 1 => [ 1, 4, 7 ], 2 => [ 2, 5, 8 ] } */

itt([1, 4, 7, 6, 4, 6, 5, 2, 1, 0, 9, 7]).groupBy(x => x % 3, true)
/* Map { 1 => Set { 1, 4, 7 }, 0 => Set { 6, 0, 9 }, 2 => Set { 5, 2 } } */
```

### .keyBy(fn)

Calls `fn(x)` for each element of this iterator and returns a map from return values of `fn` to elements. Later elements overwrite earlier elements in the map.

```js
itt([
  {name: 'Jane', age: 24},
  {name: 'Alice', age: 53},
  {name: 'Kyle', age: 33},
]).keyBy(p => p.name.toLowerCase())
/* Map {
  'jane' => { name: 'Jane', age: 24 },
  'alice' => { name: 'Alice', age: 53 },
  'kyle' => { name: 'Kyle', age: 33 } } */
```

### .forEach(fn)

Calls `fn(x)` for each element of this iterator, in iteration order. Ergonomically nicer than a `for (…) {…}` loop after a sequence of method calls or when not passing a function literal as an argument. Equivalent to `.tap(fn).drain()`.

```js
itt.irange()
  .take(10)
  .filter(x => x % 2)
  .map(x => x * x)
  .forEach(console.log)
/*
1
9
25
49
81
*/
```

### .drain()

Consumes all elements of this iterator and returns nothing (`undefined`). Useful for iterators with side effects. Equivalent to `.forEach(() => {})`.

```js
itt.range(5).tap(console.log).drain()
/*
0
1
2
3
4
*/
```

## Conversion

### .toArray()

An array of the elements in this iterator. Equivalent to `Array.from(this)`.

```js
itt.range(5).toArray()
/* [ 0, 1, 2, 3, 4 ] */
```

### .toSet()

A Set of the elements in this iterator. Equivalent to `new Set(this)`.

```js
itt.range(5).toSet()
/* Set { 0, 1, 2, 3, 4 } */
```

### .toMap()

A Map of the key-value pairs in this iterator. Equivalent to `new Map(this)`.

```js
const m = new Map
m.set('a', 1)
m.set('b', 2)
m.set('c', 3)
itt(m).map(([k, v]) => [k + '!', v * v]).toMap()
/* Map { 'a!' => 1, 'b!' => 4, 'c!' => 9 } */
```

### .toObject(empty = false)

An object containing the key-value pairs in this iterator. If `empty` is true, starts with `Object.create(null)` instead of `{}`.

```js
itt(['foo', 'bar', 'baz']).map(s => [s, s.toUpperCase()]).toObject()
/* { foo: 'FOO', bar: 'BAR', baz: 'BAZ' } */
```

## Forking

### .fork(n = 2)

An array of `n` iterators which all yield every element of this iterator in sequence.

```js
const [a, b] = itt.range(5).fork()
itt.zip(
  a.map(x => x * x),
  b.map(x => x * x * x)).toArray()
/* [ [ 0, 0 ], [ 1, 1 ], [ 4, 8 ], [ 9, 27 ], [ 16, 64 ] ] */
```

**Note:** This method caches some elements of this iterator. As any derived iterator advances, new elements are cached, and once every derived iterator has advanced past an element, that element is discarded.
