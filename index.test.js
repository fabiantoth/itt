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
