'use strict'

function id(x) {return x}
function is(xs) {return typeof xs[Symbol.iterator] === 'function' || typeof xs.next === 'function'}
function generator(gen) {return (...args) => new Iter(gen(...args))}
const G = generator
function toRaw(iter) {return iter[Symbol.iterator] ? iter[Symbol.iterator]() : iter}
function from(iter) {return new Iter(toRaw(iter))}
const empty = G(function*() {})

const range = G(function*(start, end, skip = 1) {
  if (end === undefined) {end = start; start = 0}
  if (skip > 0) for (let i = start; i < end; i += skip) yield i
  else for (let i = start; i > end; i += skip) yield i
})
const irange = G(function*(start = 0, skip = 1) {
  for (let i = start; ; i += skip) yield i
})
const replicate = G(function*(n, x) {for (let i = 0; i < n; ++i) yield x})
const forever = G(function*(x) {for (;;) yield x})
const iterate = G(function*(x, fn) {for (;;) {yield x; x = fn(x)}})

const toString = Object.prototype.toString
const split = G(function*(s, sep, limit) {
  const re = toString.call(sep) === '[object RegExp]'
  if (sep != null && !re) {
    const splitter = sep[Symbol.split]
    if (splitter != null) {
      yield* splitter.call(sep, s, limit)
      return
    }
  }
  if (limit === undefined) limit = Infinity
  if (limit <= 0) return
  s = String(s)
  if (sep === undefined) {yield s; return}
  if (!re) sep = String(sep)
  if (!sep) { // || re && sep.test('')
    const stop = Math.min(limit, s.length)
    for (let i = 0; i < stop; ++i) yield s.charAt(i)
    return
  }
  if (!s) {
    if (!re || !sep.test('')) yield ''
    return
  }
  let n = 0
  const len = s.length
  if (re) {
    let empty = null
    let first = true
    const r = new RegExp(sep.source, sep.flags.replace(/[yg]/, '') + 'g')
    for (;;) {
      const i = r.lastIndex
      const m = r.exec(s)
      if (m && empty != null) {
        yield s.slice(empty, m.index)
        if (++n >= limit) return
      }
      if (m && r.lastIndex === i) {
        ++r.lastIndex
        if (i === len) {
          if (empty == null) yield ''
          return
        }
        empty = first ? i : m.index
        if (first) {
          first = false
          continue
        }
      } else {
        const j = m ? m.index : len
        if (empty == null) {
          yield s.slice(i, j)
          if (++n >= limit) return
        }
        first = true
        empty = null
      }
      if (!m) return
      for (let i = 1, mlen = m.length; i < mlen; ++i) {
        yield m[i]
        if (++n >= limit) return
      }
    }
  } else {
    let i = 0
    const slen = sep.length
    for (;;) {
      if (n >= limit) return
      const j = s.indexOf(sep, i)
      yield s.slice(i, j === -1 ? len : j)
      if (j === -1) return
      i = j + slen
      ++n
    }
  }
})

const cartesianProduct = G(function*(...xs) {
  let els
  if (xs.length === 2 && typeof xs[0] === 'number') {
    els = Array(Math.max(0, xs[0])).fill(Array.from(xs[1]))
  } else {
    els = xs.map(a => Array.from(a))
  }
  const ls = els.map(a => a.length)
  const n = els.length
  if (n === 0) {yield []; return}
  for (let i = 0; i < n; ++i) if (ls[i] === 0) return
  const cur = Array(n).fill(0)
  for (;;) {
    const inst = Array(n)
    for (let j = 0; j < n; ++j) inst[j] = els[j][cur[j]]
    yield inst
    for (let carry = n; carry--;) {
      if (cur[carry] === ls[carry] - 1) {
        cur[carry] = 0
        if (carry === 0) return
      } else {
        ++cur[carry]
        break
      }
    }
  }
})

const permutations = G(function*(r = undefined, iter) {
  if (iter === undefined) {iter = r; r = undefined}
  const xs = Array.from(iter)
  const n = xs.length
  if (r === undefined) r = n
  if (r > n) return
  if (r <= 0 || n === 0) {yield []; return}

  let count = Array(r)
  for (let i = 0; i < r; ++i) count[i] = n - i

  for (;;) {
    yield xs.slice(0, r)
    for (let i = r; i--;) {
      const x = xs[i]
      xs.copyWithin(i, i + 1)
      xs[n-1] = x
      --count[i]
      if (count[i] === 0) {
        count[i] = n - i
        if (i === 0) return
      } else {
        break
      }
    }
  }
})

const combinations = G(function*(r = undefined, iter) {
  if (iter === undefined) {iter = r; r = undefined}
  const xs = Array.from(iter)
  const n = xs.length
  if (r === undefined) r = n
  if (r > n) return
  if (r <= 0 || n === 0) {yield []; return}

  const cur = Array(r)
  for (let i = 0; i < r; ++i) cur[i] = i

  for (;;) {
    const inst = Array(r)
    for (let i = 0; i < r; ++i) inst[i] = xs[cur[i]]
    yield inst

    let i = r - 1
    while (cur[i] === n - (r - i)) {
      if (i === 0) return
      --i
    }
    let k = ++cur[i]
    for (let j = i + 1; j < r; ++j) {
      cur[j] = ++k
    }
  }
})

const _keys = Object.keys
const entries = G(function*(o) {for (const k of _keys(o)) yield [k, o[k]]})
function keys(o) {return new Iter(_keys(o)[Symbol.iterator]())}
const values = G(function*(o) {for (const k of _keys(o)) yield o[k]})

function fork(n = 2, xs) {
  if (xs === undefined) {xs = n; n = 2}
  return new ForkSource(n, xs).derived
}
const cycle = G(function*(xs) {
  const cache = []
  for (const x of xs) {
    cache.push(x)
    yield x
  }
  for (;;) yield* cache
})
const repeat = G(function*(n, xs) {
  if (n <= 0) return
  const cache = []
  for (const x of xs) {
    cache.push(x)
    yield x
  }
  for (let i = 1; i < n; ++i) yield* cache
})
const enumerate = G(function*(xs) {let i = 0; for (const x of xs) yield [i++, x]})
const map = G(function*(fn, xs) {for (const x of xs) yield fn(x)})
const flatMap = G(function*(fn, xs) {for (const x of xs) yield* fn(x)})
const tap = G(function*(fn, xs) {for (const x of xs) {fn(x); yield x}})
const filter = G(function*(fn, xs) {for (const x of xs) if (fn(x)) yield x})
const reject = G(function*(fn, xs) {for (const x of xs) if (!fn(x)) yield x})
function partition(fn, xs) {
  return new Partition(fn, xs).iters()
}
const concat = G(function*(...xss) {for (const xs of xss) yield* xs})
const push = G(function*(...ys) {const xs = ys.pop(); yield* xs; yield* ys})
const unshift = G(function*(...ys) {const xs = ys.pop(); yield* ys; yield* xs})
const flatten = G(function*(xs) {for (const x of xs) yield* x})
const chunksOf = G(function*(n = 2, xs) {
  if (xs === undefined) {xs = n; n = 2}
  if (n <= 0) return
  let list = []
  for (const x of xs) {
    list.push(x)
    if (list.length >= n) {yield list; list = []}
  }
  if (list.length) yield list
})
const chunksBy = G(function*(f, xs) {
  let list = [], y = null
  for (const x of xs) {
    if (list.length && !f(x, y, list)) {
      yield list
      list = []
    }
    list.push(y = x)
  }
  if (list.length) yield list
})
const subsequences = G(function*(n = 2, xs) {
  if (xs === undefined) {xs = n; n = 2}
  if (n <= 0) return
  const it = toRaw(xs)
  let buffer = []
  let value, done
  while (buffer.length < n && ({value, done} = it.next(), !done)) {
    buffer.push(value)
  }
  if (!done) for (;;) {
    yield buffer
    ;({value, done} = it.next())
    if (done) return
    buffer = buffer.slice(1)
    buffer.push(value)
  }
})
const lookahead = G(function*(n = 1, xs) {
  if (xs === undefined) {xs = n; n = 1}
  const it = toRaw(xs)
  let buffer = []
  let value, done
  while (buffer.length < n && ({value, done} = it.next()) && !done) {
    buffer.push(value)
  }
  if (!done) while (({value, done} = it.next()) && !done) {
    buffer.push(value)
    yield buffer
    buffer = buffer.slice(1)
  }
  for (let i = buffer.length - 1; i-- >= 0;) {
    yield buffer
    buffer = buffer.slice(1)
  }
})
const drop = G(function*(n, xs) {for (const x of xs) if (n <= 0) yield x; else --n})
const dropWhile = G(function*(fn, xs) {let init = true; for (const x of xs) if (!init || !fn(x)) {init = false; yield x}})
const dropLast = G(function*(n, xs) {
  if (n <= 0) yield* xs; else {
    const list = []
    let i = 0
    for (const x of xs) {
      if (i >= n) yield list[i % n]
      list[i++ % n] = x
    }
  }
})
const take = G(function*(n, xs) {if (n <= 0) return; for (const x of xs) {yield x; if (--n <= 0) return}})
const takeWhile = G(function*(fn, xs) {for (const x of xs) if (fn(x)) yield x; else return})
const takeLast = G(function*(n, xs) {
  const list = []
  let i = 0
  for (const x of xs) list[i++ % n] = x
  if (n > list.length) n = list.length
  for (let j = 0; j < n; j++) yield list[(i + j) % n]
})
const transpose = G(function*(xss) {
  const its = Array.from(xss, xs => xs[Symbol.iterator]())
  if (!its.length) return
  for (;;) {
    const rs = its.map(it => it.next())
    if (rs.some(r => r.done)) return
    yield rs.map(r => r.value)
  }
})
function zip(...xss) {return transpose(xss)}
const parallel = G(function*(...xss) {
  const its = xss.map(xs => xs[Symbol.iterator]())
  for (;;) {
    const rs = its.map(it => it.next())
    if (rs.every(r => r.done)) return
    yield rs.map(r => r.value)
  }
})

function every(fn, xs) {for (const x of xs) if (!fn(x)) return false; return true}
function some(fn, xs) {for (const x of xs) if (fn(x)) return true; return false}
function detect(fn, xs) {for (const x of xs) {let y = fn(x); if (y) return y}}
function find(fn = id, xs) {
  if (xs === undefined) {xs = fn; fn = id}
  for (const x of xs) if (fn(x)) return x
}
function findLast(fn = id, xs) {
  if (xs === undefined) {xs = fn; fn = id}
  let y
  for (const x of xs) if (fn(x)) y = x
  return y
}
function findIndex(fn = id, xs) {
  if (xs === undefined) {xs = fn; fn = id}
  let i = 0
  for (const x of xs) {
    if (fn(x)) return i
    ++i
  }
  return -1
}
function findLastIndex(fn = id, xs) {
  if (xs === undefined) {xs = fn; fn = id}
  let i = 0, j = -1
  for (const x of xs) {
    if (fn(x)) j = i
    ++i
  }
  return j
}
function indexOf(y, xs) {let i = 0; for (const x of xs) {if (x === y) return i; ++i} return -1}
function lastIndexOf(y, xs) {let i = 0, j = -1; for (const x of xs) {if (x === y) j = i; ++i} return j}
function includes(y, xs) {for (const x of xs) if (x === y) return true; return false}
function reduce(a, fn, xs) {for (const x of xs) a = fn(a, x); return a}
function reduce1(fn, xs) {
  xs = xs[Symbol.iterator]()
  let x = xs.next()
  if (!x.done) {
    let a = x.value
    while (!(x = xs.next()).done) {
      a = fn(a, x.value)
    }
    return a
  }
}
const scan = G(function*(a, fn, xs) {for (const x of xs) {a = fn(a, x); yield a}})
const scan1 = G(function*(fn, xs) {
  xs = xs[Symbol.iterator]()
  let x = xs.next()
  if (!x.done) {
    let a = x.value
    yield a
    while (!(x = xs.next()).done) {
      a = fn(a, x.value)
      yield a
    }
  }
})
function inject(a, fn, xs) {for (const x of xs) fn(a, x); return a}
function forEach(fn, xs) {for (const x of xs) fn(x)}
function drain(xs) {for (const x of xs) {}}

function first(xs) {if (Array.isArray(xs)) return xs[0]; for (const x of xs) return x}
const head = first
function last(xs) {if (Array.isArray(xs)) return xs[xs.length - 1]; let z; for (const x of xs) z = x; return z}
function tail(xs) {return drop(1, xs)}
function init(xs) {return dropLast(1, xs)}

function count(xs) {if (Array.isArray(xs)) return xs.length; let i = 0; for (const x of xs) ++i; return i}
function pick(i, xs) {if (Array.isArray(xs)) return xs[i]; if (i < 0) return; for (const x of xs) if (i-- <= 0) return x}

function sum(xs) {return reduce(0, (x, y) => x + Number(y), xs)}
function mean(xs) {
  let count = 0, sum = 0
  for (const x of xs) {
    sum += Number(x)
    ++count
  }
  return sum / count
}
function product(xs) {return reduce(1, (x, y) => x * y, xs)}
function max(xs) {return reduce(-Infinity, Math.max, xs)}
function min(xs) {return reduce(Infinity, Math.min, xs)}
function minMax(xs) {
  let min = Infinity, max = -Infinity
  for (const x of xs) {
    const b = +x
    if (b < min) min = b
    if (b > max) max = b
  }
  return [min, max]
}

function groupBy(fn, unique = false, xs) {
  if (xs === undefined) {xs = unique; unique = false}
  return inject(new Map, unique ? (m, x) => {
    const k = fn(x), s = m.get(k)
    if (s) s.add(x)
    else m.set(k, new Set([x]))
  } : (m, x) => {
    const k = fn(x), l = m.get(k)
    if (l) l.push(x)
    else m.set(k, [x])
  }, xs)
}
function keyBy(fn, xs) {
  return inject(new Map, (m, x) => m.set(fn(x), x), xs)
}

const unique = G(function*(xs) {
  const used = new Set
  for (const x of xs) {
    if (!used.has(x)) {
      yield x
      used.add(x)
    }
  }
})

function toArray(xs) {return Array.from(xs)}
function toMap(xs) {return new Map(xs)}
function toSet(xs) {return new Set(xs)}
function toObject(empty = false, xs) {
  if (xs === undefined) {xs = empty; empty = false}
  const o = empty ? Object.create(null) : {}
  for (const [k, v] of xs) {
    o[k] = v
  }
  return o
}
const intersperse = G(function*(sep, xs) {
  let use = false
  for (const x of xs) {
    if (use) yield sep
    yield x
    use = true
  }
})
function join(sep = ',', xs) {
  if (xs === undefined) {xs = sep; sep = ','}
  let s = ''
  if (sep) {
    let use = false
    for (const x of xs) {
      if (use) s += sep
      s += x
      use = true
    }
  } else {
    for (const x of xs) s += x
  }
  return s
}

const slice = G(function*(start = 0, end, xs) {
  if (xs === undefined) {
    if (end === undefined) {
      xs = start; start = 0
    } else {
      xs = end; end = undefined
    }
  }
  if (Array.isArray(xs)) {
    const len = xs.length
    if (start < 0) start += len
    if (end === undefined) end = len
    else if (end < 0) end += len
    if (start < 0) start = 0
    if (end > len) end = len
    for (let i = start; i < end; ++i) yield xs[i]
  } else if (end === undefined) {
    yield* start < 0 ? takeLast(-start, xs) : drop(start, xs)
  } else if (start >= 0) {
    let i = 0
    if (end === 0) return
    else if (end > 0) {
      for (const x of xs) {
        if (i >= start) yield x
        if (++i >= end) return
      }
    } else {
      // yield* dropLast(-end, drop(start, xs))
      const list = []
      const n = -end
      for (const x of xs) {
        if (i >= start) {
          const k = (i - start) % n
          if (i - start >= n) yield list[k]
          list[k] = x
        }
        ++i
      }
    }
  } else {
    // yield* dropLast(-end, takeLast(-start, xs))
    const list = []
    let n = -start
    let i = 0
    for (const x of xs) list[i++ % n] = x
    if (n > list.length) n = list.length
    let len
    if (end >= 0) {
      if (end > i) end = i
      len = end - (i - n)
    } else {
      len = n + end
    }
    for (let j = 0; j < len; j++) yield list[(i + j) % n]
  }
})

class Iter {
  constructor(iter) {this.iter = iter}
  [Symbol.iterator]() {return this.iter}
  next() {return this.iter.next()}
  toArray() {return Array.from(this.iter)}
  toMap() {return new Map(this.iter)}
  toSet() {return new Set(this.iter)}
  toObject(empty) {return toObject(empty, this.iter)}
  join(sep) {return join(sep, this.iter)}
  intersperse(sep) {return intersperse(sep, this.iter)}

  fork(n) {return fork(n, this.iter)}
  repeat(n) {return repeat(n, this.iter)}
  cycle() {return cycle(this.iter)}
  enumerate() {return enumerate(this.iter)}
  map(fn) {return map(fn, this.iter)}
  flatMap(fn) {return flatMap(fn, this.iter)}
  tap(fn) {return tap(fn, this.iter)}
  filter(fn) {return filter(fn, this.iter)}
  reject(fn) {return reject(fn, this.iter)}
  partition(fn) {return partition(fn, this.iter)}
  concat(...xss) {return concat(this.iter, ...xss)}
  push(...xs) {return push(...xs, this.iter)}
  unshift(...xs) {return unshift(...xs, this.iter)}
  flatten() {return flatten(this.iter)}
  chunksOf(n) {return chunksOf(n, this.iter)}
  chunksBy(fn) {return chunksBy(fn, this.iter)}
  lookahead(n) {return lookahead(n, this.iter)}
  subsequences(n) {return subsequences(n, this.iter)}
  drop(n) {return drop(n, this.iter)}
  dropWhile(fn) {return dropWhile(fn, this.iter)}
  dropLast(n) {return dropLast(n, this.iter)}
  take(n) {return take(n, this.iter)}
  takeWhile(fn) {return takeWhile(fn, this.iter)}
  takeLast(n) {return takeLast(n, this.iter)}
  zip(...xss) {return zip(this.iter, ...xss)}
  transpose() {return transpose(this.iter)}
  parallel(...xss) {return parallel(this.iter, ...xss)}

  every(fn) {return every(fn, this.iter)}
  some(fn) {return some(fn, this.iter)}
  detect(fn) {return detect(fn, this.iter)}
  find(fn) {return find(fn, this.iter)}
  findLast(fn) {return findLast(fn, this.iter)}
  findIndex(fn) {return findIndex(fn, this.iter)}
  findLastIndex(fn) {return findLastIndex(fn, this.iter)}
  indexOf(x) {return indexOf(x, this.iter)}
  lastIndexOf(x) {return lastIndexOf(x, this.iter)}
  includes(x) {return includes(x, this.iter)}
  reduce(a, fn) {return reduce(a, fn, this.iter)}
  reduce1(fn) {return reduce1(fn, this.iter)}
  scan(a, fn) {return scan(a, fn, this.iter)}
  scan1(fn) {return scan1(fn, this.iter)}
  inject(a, fn) {return inject(a, fn, this.iter)}
  forEach(fn) {return forEach(fn, this.iter)}
  drain() {return drain(this.iter)}

  first() {return first(this.iter)}
  head() {return head(this.iter)}
  last() {return last(this.iter)}
  tail() {return tail(this.iter)}
  init() {return init(this.iter)}
  count() {return count(this.iter)}
  pick(i) {return pick(i, this.iter)}

  sum() {return sum(this.iter)}
  mean() {return mean(this.iter)}
  product() {return product(this.iter)}
  max() {return max(this.iter)}
  min() {return min(this.iter)}
  minMax() {return minMax(this.iter)}

  groupBy(fn, unique) {return groupBy(fn, unique, this.iter)}
  keyBy(fn) {return keyBy(fn, this.iter)}
  unique() {return unique(this.iter)}

  slice(start, end) {return slice(start, end, this.iter)}

  cartesianProduct(...xs) {
    return xs.length === 1 && typeof xs[0] === 'number' ?
      cartesianProduct(xs[0], this) : cartesianProduct(this, ...xs)}
  permutations(n) {return permutations(n, this.iter)}
  combinations(n) {return combinations(n, this.iter)}
}
const PUSH = Symbol('push')
const PULL = Symbol('pull')
class ForkSource {
  constructor(n, xs) {
    this.xs = toRaw(xs)
    this.derived = Array(n)
    for (let i = this.derived.length; i--;) {
      this.derived[i] = new ForkIter(this)
    }
  }
  [PULL]() {
    const {done, value} = this.xs.next()
    if (done) return
    for (const b of this.derived) b[PUSH](value)
  }
}
class ForkIter extends Iter {
  constructor(source) {
    super()
    this.iter = this
    this.buffer = []
    this.source = source
  }
  [PUSH](v) {this.buffer.push(v)}
  next() {
    if (!this.buffer.length) this.source[PULL]()
    return this.buffer.length ? {done: false, value: this.buffer.shift()} : {done: true, value: undefined}
  }
}
const DONE = {}
class Partition {
  constructor(fn, xs) {
    this.fn = fn
    this.xs = toRaw(xs)
    this.keep = new PartitionIter(this, true)
    this.reject = new PartitionIter(this, false)
  }
  iters() {return [this.keep, this.reject]}
  [PULL](keep) {
    keep = !!keep
    for (;;) {
      const {done, value} = this.xs.next()
      if (done) return DONE
      const kept = !!this.fn(value)
      if (kept === keep) return value
      ;(kept ? this.keep : this.reject)[PUSH](value)
    }
  }
}
class PartitionIter extends Iter {
  constructor(source, keep) {
    super()
    this.iter = this
    this.buffer = []
    this.source = source
    this.keep = keep
  }
  [PUSH](value) {this.buffer.push(value)}
  next() {
    if (this.buffer.length) {
      return {done: false, value: this.buffer.shift()}
    }
    const value = this.source[PULL](this.keep)
    return value === DONE ? {done: true, value: undefined} : {done: false, value}
  }
}

Object.assign(module.exports = from, {
  is, from, generator, empty,
  range, irange,
  replicate, forever, iterate,
  split,
  entries, keys, values,
  toArray, toMap, toSet, toObject,
  intersperse, join,
  cartesianProduct, permutations, combinations,

  fork, repeat, cycle, enumerate,
  map, tap, flatMap, filter, reject, partition,
  concat, push, unshift, flatten,
  chunksOf, chunksBy, lookahead, subsequences,
  drop, dropWhile, dropLast,
  take, takeWhile, takeLast,
  zip, transpose, parallel,
  every, some, detect,
  find, findLast, findIndex, findLastIndex, indexOf, lastIndexOf, includes,
  reduce, reduce1, scan, scan1, inject, forEach, drain,
  first, head, last, tail, init,
  count, pick,
  sum, mean, product, min, max, minMax,
  groupBy, keyBy, unique,
  slice,
})
