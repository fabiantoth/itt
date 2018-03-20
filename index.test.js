const itt = require('itt')

test('is', () => {
  expect(itt.is(1)).toBeFalsy()
  expect(itt.is({})).toBeFalsy()
  expect(itt.is(Object)).toBeFalsy()
  expect(itt.is('test')).toBeTruthy()
  expect(itt.is('test'[Symbol.iterator]())).toBeTruthy()
  expect(itt.is([1, 2, 3])).toBeTruthy()
  expect(itt.is([1, 2, 3][Symbol.iterator]())).toBeTruthy()
  expect(itt.is(itt.range(5))).toBeTruthy()
})

describe('generator', () => {
  test('returns a wrapped generator', () => {
    expect(itt.generator(function*() {})().toArray).toBeDefined()
  })
  test('forwards arguments', () => {
    const g = itt.generator(function*(a = 1, b = 2) {
      yield a
      yield b
    })
    expect(Array.from(g())).toEqual([1, 2])
    expect(Array.from(g(3))).toEqual([3, 2])
    expect(Array.from(g(3, 4))).toEqual([3, 4])
  })
})

test('from', () => {
  expect(itt([1, 2, 3, 4]).toArray).toBeDefined()
  expect(itt.from([1, 2, 3, 4]).toArray).toBeDefined()
})

describe('empty', () => {
  test('returns wrapped iterators', () => {
    expect(itt.empty().toArray).toBeDefined()
  })
  test('returns an empty iterator', () => {
    expect(itt.empty().next()).toEqual({value: undefined, done: true})
    expect(Array.from(itt.empty())).toEqual([])
  })
})

describe('range', () => {
  test('returns wrapped iterators', () => {
    expect(itt.range(5).toArray).toBeDefined()
  })
  test('yields 0, 1, ..., n-1 when given one argument', () => {
    expect(Array.from(itt.range(5))).toEqual([0, 1, 2, 3, 4])
    expect(Array.from(itt.range(10))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(Array.from(itt.range(0))).toEqual([])
  })
  test('yields n, n+1, ..., m-1 when given two arguments', () => {
    expect(Array.from(itt.range(-2, 2))).toEqual([-2, -1, 0, 1])
    expect(Array.from(itt.range(1, 5))).toEqual([1, 2, 3, 4])
    expect(Array.from(itt.range(5, 5))).toEqual([])
    expect(Array.from(itt.range(5, 1))).toEqual([])
  })
  test('yields n, n+k, ..., m-k when given three arguments', () => {
    expect(Array.from(itt.range(4, 13, 3))).toEqual([4, 7, 10])
    expect(Array.from(itt.range(5, -5, -1))).toEqual([5, 4, 3, 2, 1, 0, -1, -2, -3, -4])
    expect(Array.from(itt.range(5, -5, -2))).toEqual([5, 3, 1, -1, -3])
    expect(Array.from(itt.range(-5, 10, -1))).toEqual([])
    expect(Array.from(itt.range(5, 5, 3))).toEqual([])
    expect(Array.from(itt.range(5, 5, -3))).toEqual([])
    expect(Array.from(itt.range(5, 1, 3))).toEqual([])
  })
})

describe('irange', () => {
  test('returns wrapped iterators', () => {
    expect(itt.irange().toArray).toBeDefined()
  })
  test('yields 0, 1, 2, ... when given no arguments', () => {
    const i = itt.irange()
    for (let value = 0; value < 10; ++value) {
      expect(i.next()).toEqual({value, done: false})
    }
  })
  test('yields n, n+1, n+2, ... when given one argument', () => {
    const i = itt.irange(5)
    for (let value = 5; value < 15; ++value) {
      expect(i.next()).toEqual({value, done: false})
    }
  })
  test('yields n, n+k, n+2k, ... when given two arguments', () => {
    const i = itt.irange(5, -1)
    for (let value = 5; value > -5; --value) {
      expect(i.next()).toEqual({value, done: false})
    }
  })
})

describe('replicate', () => {
  test('returns wrapped iterators', () => {
    expect(itt.irange().toArray).toBeDefined()
  })
  test('yields x n times', () => {
    expect(Array.from(itt.replicate(10, 3))).toEqual([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])
  })
  test('is empty if n <= 0', () => {
    expect(Array.from(itt.replicate(0, 3))).toEqual([])
    expect(Array.from(itt.replicate(-1, 3))).toEqual([])
  })
})

describe('forever', () => {
  test('returns wrapped iterators', () => {
    expect(itt.forever().toArray).toBeDefined()
  })
  test('yields its argument forever', () => {
    const i = itt.forever('a')
    for (let n = 20; n--;) {
      expect(i.next()).toEqual({value: 'a', done: false})
    }
  })
})

describe('iterate', () => {
  test('returns wrapped iterators', () => {
    expect(itt.iterate().toArray).toBeDefined()
  })
  test('yields the initial value first', () => {
    expect(itt.iterate(1, x => x + 1).next()).toEqual({value: 1, done: false})
  })
  test('yields repeated applications of its input function', () => {
    const i = itt.iterate(1, x => x * 2)
    expect(i.next()).toEqual({value: 1, done: false})
    expect(i.next()).toEqual({value: 2, done: false})
    expect(i.next()).toEqual({value: 4, done: false})
    expect(i.next()).toEqual({value: 8, done: false})

    const j = itt.iterate('a', x => `(${x})`)
    expect(j.next()).toEqual({value: 'a', done: false})
    expect(j.next()).toEqual({value: '(a)', done: false})
    expect(j.next()).toEqual({value: '((a))', done: false})
    expect(j.next()).toEqual({value: '(((a)))', done: false})
  })
})

describe('entries', () => {
  test('returns wrapped iterators', () => {
    expect(itt.entries({}).toArray).toBeDefined()
  })
  test('yields no entries for empty objects', () => {
    expect(Array.from(itt.entries({}))).toEqual([])
    expect(Array.from(itt.entries(Object.create(null)))).toEqual([])
    expect(Array.from(itt.entries(Object.create({a: 1, b: 2})))).toEqual([])
  })
  test(`yields its input object's own key/value entries`, () => {
    expect(Array.from(itt.entries({a: 1, b: 2, c: 3}))).toEqual([['a', 1], ['b', 2], ['c', 3]])
  })
  test('yields only own key/value entries', () => {
    expect(Array.from(itt.entries(Object.assign(Object.create({a: 1, b: 2, c: 3}), {d: 9, e: 8})))).toEqual([['d', 9], ['e', 8]])
  })
})

describe('keys', () => {
  test('returns wrapped iterators', () => {
    expect(itt.keys({}).toArray).toBeDefined()
  })
  test('yields no keys for empty objects', () => {
    expect(Array.from(itt.keys({}))).toEqual([])
    expect(Array.from(itt.keys(Object.create(null)))).toEqual([])
    expect(Array.from(itt.keys(Object.create({a: 1, b: 2})))).toEqual([])
  })
  test(`yields its input object's own keys`, () => {
    expect(Array.from(itt.keys({a: 1, b: 2, c: 3}))).toEqual(['a', 'b', 'c'])
  })
  test('yields only own keys', () => {
    expect(Array.from(itt.keys(Object.assign(Object.create({a: 1, b: 2, c: 3}), {d: 9, e: 8})))).toEqual(['d', 'e'])
  })
})

describe('values', () => {
  test('returns wrapped iterators', () => {
    expect(itt.values({}).toArray).toBeDefined()
  })
  test('yields no values for empty objects', () => {
    expect(Array.from(itt.values({}))).toEqual([])
    expect(Array.from(itt.values(Object.create(null)))).toEqual([])
    expect(Array.from(itt.values(Object.create({a: 1, b: 2})))).toEqual([])
  })
  test(`yields its input object's own values`, () => {
    expect(Array.from(itt.values({a: 1, b: 2, c: 3}))).toEqual([1, 2, 3])
  })
  test('yields only own values', () => {
    expect(Array.from(itt.values(Object.assign(Object.create({a: 1, b: 2, c: 3}), {d: 9, e: 8})))).toEqual([9, 8])
  })
})

describe('fork', () => {
  test('returns wrapped iterators', () => {
    const [a, b] = itt.fork([1, 2, 3])
    expect(a.toArray).toBeDefined()
    expect(b.toArray).toBeDefined()
    const [c, d] = itt([1, 2, 3]).fork()
    expect(c.toArray).toBeDefined()
    expect(d.toArray).toBeDefined()
  })
  test('returns two forks by default', () => {
    expect(itt.fork([1, 2, 3]).length).toBe(2)
    expect(itt([1, 2, 3]).fork().length).toBe(2)
  })
  test('returns n forks', () => {
    expect(itt.fork(1, [1, 2, 3]).length).toBe(1)
    expect(itt([1, 2, 3]).fork(1).length).toBe(1)
    expect(itt.fork(4, [1, 2, 3]).length).toBe(4)
    expect(itt([1, 2, 3]).fork(4).length).toBe(4)
  })
  test('returns no forks for n = 0', () => {
    expect(itt.fork(0, [1, 2, 3]).length).toBe(0)
    expect(itt([1, 2, 3]).fork(0).length).toBe(0)
  })
  test('returns independent iterators', () => {
    const [a, b, c] = itt.fork(3, function*() {yield 1; yield 2; yield 3}())
    expect(Array.from(a)).toEqual([1, 2, 3])
    expect(Array.from(b)).toEqual([1, 2, 3])
    expect(Array.from(c)).toEqual([1, 2, 3])

    const [d, e, f, g] = itt.fork(4, function*() {yield 1; yield 2; yield 3}())
    expect(Array.from(g)).toEqual([1, 2, 3])
    expect(Array.from(f)).toEqual([1, 2, 3])
    expect(Array.from(e)).toEqual([1, 2, 3])
    expect(Array.from(d)).toEqual([1, 2, 3])
  })
  test('discards values that have been iterated completely', () => {
    const [a, b, c] = itt.fork(3, function*() {yield 1; yield 2; yield 3}())
    c.next()
    b.next()
    a.next()
    expect(a.buffer).toEqual([])
    expect(b.buffer).toEqual([])
    expect(c.buffer).toEqual([])
  })
  test(`doesn't consume the iterator before any derived iterators are iterated`, () => {
    let it = false
    itt.fork(function*() {it = true; yield 1}())
    expect(it).toBe(false)
  })
})

describe('cycle', () => {
  test('returns wrapped iterators', () => {
    expect(itt.cycle([1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).cycle().toArray).toBeDefined()
  })
  test('cycles the iterator endlessly', () => {
    const i = itt.cycle([1, 2, 3])
    expect(i.next()).toEqual({value: 1, done: false})
    expect(i.next()).toEqual({value: 2, done: false})
    expect(i.next()).toEqual({value: 3, done: false})
    expect(i.next()).toEqual({value: 1, done: false})
    expect(i.next()).toEqual({value: 2, done: false})
    expect(i.next()).toEqual({value: 3, done: false})
    expect(i.next()).toEqual({value: 1, done: false})
    expect(i.next()).toEqual({value: 2, done: false})
    expect(i.next()).toEqual({value: 3, done: false})
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.cycle(function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('repeat', () => {
  test('returns wrapped iterators', () => {
    expect(itt.repeat(3, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).repeat(3).toArray).toBeDefined()
  })
  test('returns an empty iterator for n <= 0', () => {
    expect(Array.from(itt.repeat(0, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.repeat(-1, [1, 2, 3]))).toEqual([])
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.repeat(0, []))).toEqual([])
    expect(Array.from(itt.repeat(-1, []))).toEqual([])
    expect(Array.from(itt.repeat(5, []))).toEqual([])
    expect(Array.from(itt.repeat(100, []))).toEqual([])
    expect(Array.from(itt.repeat(100, function*() {}()))).toEqual([])
  })
  test('yields n copies of the iterator', () => {
    expect(Array.from(itt.repeat(3, [4, 5, 6]))).toEqual([4, 5, 6, 4, 5, 6, 4, 5, 6])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.repeat(2, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('enumerate', () => {
  test('returns wrapped iterators', () => {
    expect(itt.enumerate(['a', 'b', 'c']).toArray).toBeDefined()
    expect(itt(['a', 'b', 'c']).enumerate().toArray).toBeDefined()
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.enumerate([]))).toEqual([])
    expect(Array.from(itt.enumerate(function*() {}()))).toEqual([])
  })
  test('yields pairs of indices and iterator elements', () => {
    expect(Array.from(itt.enumerate(['a', 'b', 'c', 'd']))).toEqual([[0, 'a'], [1, 'b'], [2, 'c'], [3, 'd']])
    expect(Array.from(itt.enumerate(function*() {yield 5; yield 7; yield 10}()))).toEqual([[0, 5], [1, 7], [2, 10]])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.enumerate(function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('map', () => {
  test('returns wrapped iterators', () => {
    expect(itt.map(x => x + 1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).map(x => x + 1).toArray).toBeDefined()
  })
  test('returns an empty iterator when given an empty iterator', () => {
    const f = jest.fn(), g = jest.fn()
    expect(Array.from(itt.map(f, []))).toEqual([])
    expect(Array.from(itt.map(g, function*() {}()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  test('applies fn to each element of the iterator', () => {
    expect(Array.from(itt.map(x => x * x, function*() {yield 1; yield 2; yield 3}()))).toEqual([1, 4, 9])
    expect(Array.from(itt.map(x => x + '!', ['cats', 'dogs', 'cows']))).toEqual(['cats!', 'dogs!', 'cows!'])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.map(x => x + 1, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('flatMap', () => {
  test('returns wrapped iterators', () => {
    expect(itt.flatMap(x => [x, x], [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).map(x => [x, x]).toArray).toBeDefined()
  })
  test('returns an empty iterator when given an empty iterator', () => {
    const f = jest.fn(), g = jest.fn()
    expect(Array.from(itt.flatMap(f, []))).toEqual([])
    expect(Array.from(itt.flatMap(g, function*() {}()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  test('applies fn to each element of the iterator and flattens the results', () => {
    expect(Array.from(itt.flatMap(x => [x, x + 1], [3, 5, 7]))).toEqual([3, 4, 5, 6, 7, 8])
  })
  test('accepts child iterators', () => {
    expect(Array.from(itt.flatMap(x => function*() {yield x; yield x * x}(), function*() {yield 1; yield 2; yield 3}()))).toEqual([1, 1, 2, 4, 3, 9])
  })
  test('ignores empty results', () => {
    expect(Array.from(itt.flatMap(x => x % 2 ? [] : [x * x * x], [9, 5, 2, 4, 7]))).toEqual([8, 64])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.flatMap(x => [x, x], function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('tap', () => {
  test('returns wrapped iterators', () => {
    expect(itt.tap(x => {}, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).tap(x => {}).toArray).toBeDefined()
  })
  test('returns its input iterator unchanged', () => {
    expect(Array.from(itt.tap(x => x + 1, [1, 3, 5, 7]))).toEqual([1, 3, 5, 7])
  })
  test('returns an empty iterator when given an empty iterator', () => {
    const f = jest.fn(), g = jest.fn()
    expect(Array.from(itt.tap(f, []))).toEqual([])
    expect(Array.from(itt.tap(g, function*() {}()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  test('applies fn to each iterator element', () => {
    const res = []
    expect(Array.from(itt.tap(x => res.push(8 - x), [5, 6, 7]))).toEqual([5, 6, 7])
    expect(res).toEqual([3, 2, 1])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.tap(x => {}, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('filter', () => {
  test('returns wrapped iterators', () => {
    expect(itt.filter(x => true, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).filter(x => true).toArray).toBeDefined()
  })
  test('returns an empty iterator when given an empty iterator', () => {
    const f = jest.fn(), g = jest.fn()
    expect(Array.from(itt.filter(f, []))).toEqual([])
    expect(Array.from(itt.filter(g, function*() {}()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  test('yields only elements which satisfy fn', () => {
    expect(Array.from(itt.filter(x => x % 2, [9, 8, 6, 4, 5, 3, 1, 2]))).toEqual([9, 5, 3, 1])
  })
  test('returns an empty iterator when no elements satisfy fn', () => {
    expect(Array.from(itt.filter(x => false, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.filter(x => false, function*() {yield 1; yield 2; yield 3}()))).toEqual([])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false
    const i = itt.filter(x => !(x % 2), function*() {it1 = true; yield 1; it2 = true; yield 2; it3 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 2, done: false})
    expect(it1).toBe(true)
    expect(it2).toBe(true)
    expect(it3).toBe(false)
  })
})

describe('reject', () => {
  test('returns wrapped iterators', () => {
    expect(itt.reject(x => false, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).reject(x => false).toArray).toBeDefined()
  })
  test('returns an empty iterator when given an empty iterator', () => {
    const f = jest.fn(), g = jest.fn()
    expect(Array.from(itt.reject(f, []))).toEqual([])
    expect(Array.from(itt.reject(g, function*() {}()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  test(`yields only elements which don't satisfy fn`, () => {
    expect(Array.from(itt.reject(x => x % 2, [9, 8, 6, 4, 5, 3, 1, 2]))).toEqual([8, 6, 4, 2])
  })
  test('returns an empty iterator when every element satisfies fn', () => {
    expect(Array.from(itt.reject(x => true, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.reject(x => true, function*() {yield 1; yield 2; yield 3}()))).toEqual([])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false
    const i = itt.reject(x => x % 2, function*() {it1 = true; yield 1; it2 = true; yield 2; it3 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 2, done: false})
    expect(it1).toBe(true)
    expect(it2).toBe(true)
    expect(it3).toBe(false)
  })
})

describe('concat', () => {
  test('returns wrapped iterators', () => {
    expect(itt.concat([1, 2, 3], [4, 5, 6]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).concat([4, 5, 6]).toArray).toBeDefined()
  })
  test('returns an empty iterator when given no iterators', () => {
    expect(Array.from(itt.concat())).toEqual([])
  })
  test('returns an empty iterator when given all empty iterators', () => {
    expect(Array.from(itt.concat([], function*() {}(), []))).toEqual([])
  })
  test('yields the concatenation of its input iterators', () => {
    expect(Array.from(itt.concat([1, 2, 3]))).toEqual([1, 2, 3])
    expect(Array.from(itt.concat([1, 2, 3], function*() {yield 4; yield 5}(), [6, 7]))).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false, it4 = false
    const i = itt.concat(function*() {it1 = true; yield 1; it2 = true; yield 2}(), function*() {it3 = true; yield 3; it4 = true; yield 4}())
    expect(it1).toBe(false)
    expect(it3).toBe(false)
    i.next()
    expect(it2).toBe(false)
    expect(it3).toBe(false)
    i.next()
    expect(it2).toBe(true)
    expect(it3).toBe(false)
    i.next()
    expect(it2).toBe(true)
    expect(it3).toBe(true)
    expect(it4).toBe(false)
  })
})

describe('push', () => {
  test('returns wrapped iterators', () => {
    expect(itt.push(4, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).push(4).toArray).toBeDefined()
  })
  test('returns an empty iterator when given an empty iterator and no elements', () => {
    expect(Array.from(itt.push([]))).toEqual([])
    expect(Array.from(itt.push(function*() {}()))).toEqual([])
  })
  test('yields just the extra elements when given an empty iterator', () => {
    expect(Array.from(itt.push(1, []))).toEqual([1])
    expect(Array.from(itt.push(1, function*() {}()))).toEqual([1])
  })
  test('yields just the iterator elements when given no extra elements', () => {
    expect(Array.from(itt.push([1, 2, 3]))).toEqual([1, 2, 3])
  })
  test('yields the extra elements in argument order', () => {
    expect(Array.from(itt.push(4, 5, 6, [1, 2, 3]))).toEqual([1, 2, 3, 4, 5, 6])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.push(3, 4, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('unshift', () => {
  test('returns wrapped iterators', () => {
    expect(itt.unshift(4, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).unshift(4).toArray).toBeDefined()
  })
  test('returns an empty iterator when given an empty iterator and no elements', () => {
    expect(Array.from(itt.unshift([]))).toEqual([])
    expect(Array.from(itt.unshift(function*() {}()))).toEqual([])
  })
  test('yields just the extra elements when given an empty iterator', () => {
    expect(Array.from(itt.unshift(1, []))).toEqual([1])
    expect(Array.from(itt.unshift(1, function*() {}()))).toEqual([1])
  })
  test('yields just the iterator elements when given no extra elements', () => {
    expect(Array.from(itt.unshift([1, 2, 3]))).toEqual([1, 2, 3])
  })
  test('yields the extra elements in argument order', () => {
    expect(Array.from(itt.unshift(4, 5, 6, [1, 2, 3]))).toEqual([4, 5, 6, 1, 2, 3])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.unshift(3, 4, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it1).toBe(false)
    i.next()
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('flatten', () => {
  test('returns wrapped iterators', () => {
    expect(itt.flatten([[1, 2, 3], [4, 5, 6]]).toArray).toBeDefined()
    expect(itt([[1, 2, 3], [4, 5, 6]]).flatten().toArray).toBeDefined()
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.flatten([]))).toEqual([])
    expect(Array.from(itt.flatten(function*() {}(), []))).toEqual([])
  })
  test('returns an empty iterator when given all empty child iterators', () => {
    expect(Array.from(itt.flatten([[], function*() {}(), []]))).toEqual([])
  })
  test('yields the concatenation of each element of its input iterators', () => {
    expect(Array.from(itt.flatten([[1, 2, 3]]))).toEqual([1, 2, 3])
    expect(Array.from(itt.flatten([[1, 2, 3], function*() {yield 4; yield 5}(), [6, 7]]))).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false, it4 = false
    const i = itt.flatten([function*() {it1 = true; yield 1; it2 = true; yield 2}(), function*() {it3 = true; yield 3; it4 = true; yield 4}()])
    expect(it1).toBe(false)
    expect(it3).toBe(false)
    i.next()
    expect(it2).toBe(false)
    expect(it3).toBe(false)
    i.next()
    expect(it2).toBe(true)
    expect(it3).toBe(false)
    i.next()
    expect(it2).toBe(true)
    expect(it3).toBe(true)
    expect(it4).toBe(false)
  })
})

describe('chunksOf', () => {
  test('returns wrapped iterators', () => {
    expect(itt.chunksOf(2, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).chunksOf(2).toArray).toBeDefined()
  })
  test('defaults to subsequences of 2', () => {
    expect(Array.from(itt.chunksOf([1, 2, 3, 4]))).toEqual([[1, 2], [3, 4]])
    expect(Array.from(itt([1, 2, 3, 4]).chunksOf())).toEqual([[1, 2], [3, 4]])
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.chunksOf(2, []))).toEqual([])
    expect(Array.from(itt.chunksOf(5, function*() {}()))).toEqual([])
  })
  test('yields chunks of n items', () => {
    expect(Array.from(itt.chunksOf(3, [1, 2, 3, 4, 5, 6, 7, 8, 9]))).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    expect(Array.from(itt.chunksOf(1, [1, 2, 3, 4, 5, 6, 7, 8, 9]))).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9]])
  })
  test(`yields fewer items in the last chunk if there aren't an even number of elements`, () => {
    expect(Array.from(itt.chunksOf(3, [1, 2, 3, 4]))).toEqual([[1, 2, 3], [4]])
    expect(Array.from(itt.chunksOf(3, [1, 2, 3, 4, 5]))).toEqual([[1, 2, 3], [4, 5]])
  })
  test(`yields the entire iterator if there are not more than n elements`, () => {
    expect(Array.from(itt.chunksOf(4, [1, 2, 3, 4]))).toEqual([[1, 2, 3, 4]])
    expect(Array.from(itt.chunksOf(10, [1, 2]))).toEqual([[1, 2]])
    expect(Array.from(itt.chunksOf(10, [9]))).toEqual([[9]])
  })
  test('yields [] forever if n <= 0', () => {
    const i = itt.chunksOf(0, [1, 2, 3, 4])
    for (let n = 100; n--;) {
      expect(i.next()).toEqual({value: [], done: false})
    }
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.chunksOf(2, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: [1, 2], done: false})
    expect(it2).toBe(false)
  })
})

describe('subsequences', () => {
  test('returns wrapped iterators', () => {
    expect(itt.subsequences(2, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).subsequences(2).toArray).toBeDefined()
  })
  test('defaults to subsequences of 2', () => {
    expect(Array.from(itt.subsequences([1, 2, 3, 4]))).toEqual([[1, 2], [2, 3], [3, 4]])
    expect(Array.from(itt([1, 2, 3, 4]).subsequences())).toEqual([[1, 2], [2, 3], [3, 4]])
  })
  test('yields subsequences of the iterator', () => {
    expect(Array.from(itt.subsequences(4, [1, 2, 3, 4, 5, 6]))).toEqual([[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]])
    expect(Array.from(itt.subsequences(4, [1, 2, 3, 4]))).toEqual([[1, 2, 3, 4]])
    expect(Array.from(itt.subsequences(1, [1, 2, 3, 4]))).toEqual([[1], [2], [3], [4]])
  })
  test(`returns an empty iterator when there aren't enough elements`, () => {
    expect(Array.from(itt.subsequences(5, [1, 2, 3, 4]))).toEqual([])
    expect(Array.from(itt.subsequences(5, [1]))).toEqual([])
    expect(Array.from(itt.subsequences(2, [1]))).toEqual([])
  })
  test('yields [] forever if n <= 0', () => {
    const i = itt.subsequences(0, [1, 2, 3, 4])
    for (let n = 100; n--;) {
      expect(i.next()).toEqual({value: [], done: false})
    }
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.subsequences(2, []))).toEqual([])
    expect(Array.from(itt.subsequences(5, function*() {}()))).toEqual([])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.subsequences(2, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: [1, 2], done: false})
    expect(it2).toBe(false)
  })
})

describe('lookahead', () => {
  test('returns wrapped iterators', () => {
    expect(itt.lookahead(1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).lookahead(1).toArray).toBeDefined()
  })
  test('defaults to lookahead of 1', () => {
    expect(Array.from(itt.lookahead([1, 2, 3, 4]))).toEqual([[1, 2], [2, 3], [3, 4], [4]])
    expect(Array.from(itt([1, 2, 3, 4]).lookahead())).toEqual([[1, 2], [2, 3], [3, 4], [4]])
  })
  test('yields n lookahead elements', () => {
    expect(Array.from(itt.lookahead(3, [1, 2, 3, 4, 5, 6]))).toEqual([[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6], [5, 6], [6]])
    expect(Array.from(itt.lookahead(3, [1, 2, 3, 4]))).toEqual([[1, 2, 3, 4], [2, 3, 4], [3, 4], [4]])
    expect(Array.from(itt.lookahead(1, [1, 2, 3, 4]))).toEqual([[1, 2], [2, 3], [3, 4], [4]])
    expect(Array.from(itt.lookahead(3, [1, 2]))).toEqual([[1, 2], [2]])
    expect(Array.from(itt.lookahead(4, [1]))).toEqual([[1]])
  })
  test('yields no lookahead if n <= 0', () => {
    expect(Array.from(itt.lookahead(0, [1, 2, 3, 4]))).toEqual([[1], [2], [3], [4]])
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.lookahead(2, []))).toEqual([])
    expect(Array.from(itt.lookahead(5, function*() {}()))).toEqual([])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.lookahead(1, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: [1, 2], done: false})
    expect(it2).toBe(false)
  })
})

describe('drop', () => {
  test('returns wrapped iterators', () => {
    expect(itt.drop(1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).drop(1).toArray).toBeDefined()
  })
  test('yields all but the first n elements', () => {
    expect(Array.from(itt.drop(2, [1, 2, 3, 4, 5, 6]))).toEqual([3, 4, 5, 6])
    expect(Array.from(itt.drop(1, function*() {yield 3; yield 2; yield 1;}()))).toEqual([2, 1])
  })
  test(`returns an empty iterator if there aren't enough elements`, () => {
    expect(Array.from(itt.drop(5, [1, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.drop(3, [1]))).toEqual([])
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.drop(2, []))).toEqual([])
    expect(Array.from(itt.drop(5, function*() {}()))).toEqual([])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.drop(1, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 2, done: false})
    expect(it2).toBe(false)
  })
})

describe('dropWhile', () => {
  test('returns wrapped iterators', () => {
    expect(itt.dropWhile(n => n < 3, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).dropWhile(n => n < 3).toArray).toBeDefined()
  })
  test('yields all but the initial elements that satisfy fn', () => {
    expect(Array.from(itt.dropWhile(n => n % 2, [1, 3, 4, 5, 6, 7]))).toEqual([4, 5, 6, 7])
    expect(Array.from(itt.dropWhile(n => n > 1, function*() {yield 3; yield 2; yield 1; yield 4}()))).toEqual([1, 4])
  })
  test(`returns an empty iterator if all elements satisfy fn`, () => {
    expect(Array.from(itt.dropWhile(n => n < 10, [1, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.dropWhile(n => true, [1]))).toEqual([])
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.dropWhile(n => false, []))).toEqual([])
    expect(Array.from(itt.dropWhile(n => false, function*() {}()))).toEqual([])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.dropWhile(n => n <= 1, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 2, done: false})
    expect(it2).toBe(false)
  })
})

describe('dropLast', () => {
  test('returns wrapped iterators', () => {
    expect(itt.dropLast(1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).dropLast(1).toArray).toBeDefined()
  })
  test('yields all but the last n elements', () => {
    expect(Array.from(itt.dropLast(1, [1, 2, 3, 4, 5, 6]))).toEqual([1, 2, 3, 4, 5])
    expect(Array.from(itt.dropLast(1, function*() {yield 3; yield 2; yield 1;}()))).toEqual([3, 2])
  })
  test(`returns an empty iterator if there aren't enough elements`, () => {
    expect(Array.from(itt.dropLast(5, [1, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.dropLast(3, [1]))).toEqual([])
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.dropLast(2, []))).toEqual([])
    expect(Array.from(itt.dropLast(5, function*() {}()))).toEqual([])
  })
  test(`doesn't consume elements until necessary`, () => {
    let it1 = false, it2 = false
    const i = itt.dropLast(1, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 1, done: false})
    expect(it2).toBe(false)
  })
})

describe('take', () => {
  test('returns wrapped iterators', () => {
    expect(itt.take(1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).take(1).toArray).toBeDefined()
  })
  test('yields the first n elements', () => {
    expect(Array.from(itt.take(3, [1, 2, 3, 4, 5, 6]))).toEqual([1, 2, 3])
    expect(Array.from(itt.take(1, function*() {yield 3; yield 2; yield 1;}()))).toEqual([3])
  })
  test(`yields all elements if there aren't enough`, () => {
    expect(Array.from(itt.take(5, [1, 2, 3, 4, 5]))).toEqual([1, 2, 3, 4, 5])
    expect(Array.from(itt.take(3, [1]))).toEqual([1])
  })
  test('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.take(2, []))).toEqual([])
    expect(Array.from(itt.take(5, function*() {}()))).toEqual([])
  })
  test(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.take(1, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 1, done: false})
    expect(i.next()).toEqual({value: undefined, done: true})
    expect(it2).toBe(false)
  })
})

describe('every', () => {
  test('returns true for an empty iterator', () => {
    expect(itt.every(x => false, [])).toBe(true)
    expect(itt.every(x => false, function*() {}())).toBe(true)
  })
  test('returns true if every element satisfies fn', () => {
    expect(itt.every(x => x % 2, [3, 5, 7])).toBe(true)
  })
  test('returns false if any element does not satisfy fn', () => {
    expect(itt.every(x => x % 2, [1, 2, 3, 4, 5])).toBe(false)
    expect(itt.every(x => x > 10, [1])).toBe(false)
  })
})

describe('some', () => {
  test('returns false for an empty iterator', () => {
    expect(itt.some(x => true, [])).toBe(false)
    expect(itt.some(x => true, function*() {}())).toBe(false)
  })
  test('returns true if any element satisfies fn', () => {
    expect(itt.some(x => x > 1, [3, 5, 7])).toBe(true)
    expect(itt.some(x => x % 2, [1, 2, 3, 4, 5])).toBe(true)
  })
  test('returns false if no element satisfies fn', () => {
    expect(itt.some(x => x > 10, [1, 2, 3, 4, 5])).toBe(false)
  })
})

describe('find', () => {
  test('returns an element that satisfies fn', () => {
    expect(itt.find(x => x === 3, [1, 2, 3, 4])).toBe(3)
    expect(itt.find(x => x === 0, [0, 1, 2, 3, 4])).toBe(0)
    expect(itt.find(x => x > 3, [1, 2, 3, 4])).toBe(4)
  })
  test('returns the first element that satisfies fn', () => {
    expect(itt.find(x => x > 0, [1, 2, 3])).toBe(1)
    expect(itt.find(x => x > 2, [1, 2, 3, 4, 5])).toBe(3)
  })
  test('returns undefined if no element satisfies fn', () => {
    expect(itt.find(x => x === 10, [1, 2, 3])).toBe(undefined)
  })
})

describe('mean', () => {
  test('returns the arithmetic mean of the iterator', () => {
    expect(itt.mean([1, 2, 3, 4])).toBe(2.5)
    expect(itt([1, 2, 3]).mean()).toBe(2)
  })
  test('returns NaN for an empty iterator', () => {
    expect(itt.mean([])).toBe(NaN)
    expect(itt(function*() {}()).mean()).toBe(NaN)
  })
})
