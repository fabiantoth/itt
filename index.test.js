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

test('generator', () => {
  const g = itt.generator(function*() {
    yield 1
    yield 2
    yield 3
  })
  expect(g().toArray).toBeDefined()
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
  test('accepts one argument', () => {
    expect(Array.from(itt.range(5))).toEqual([0, 1, 2, 3, 4])
    expect(Array.from(itt.range(10))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(Array.from(itt.range(0))).toEqual([])
  })
  test('accepts two arguments', () => {
    expect(Array.from(itt.range(-2, 2))).toEqual([-2, -1, 0, 1])
    expect(Array.from(itt.range(1, 5))).toEqual([1, 2, 3, 4])
    expect(Array.from(itt.range(5, 5))).toEqual([])
    expect(Array.from(itt.range(5, 1))).toEqual([])
  })
  test('accepts three arguments', () => {
    expect(Array.from(itt.range(4, 13, 3))).toEqual([4, 7, 10])
    expect(Array.from(itt.range(5, -5, -1))).toEqual([5, 4, 3, 2, 1, 0, -1, -2, -3, -4])
    expect(Array.from(itt.range(5, -5, -2))).toEqual([5, 3, 1, -1, -3])
    expect(Array.from(itt.range(-5, 10, -1))).toEqual([])
    expect(Array.from(itt.range(5, 5, 3))).toEqual([])
    expect(Array.from(itt.range(5, 5, -3))).toEqual([])
    expect(Array.from(itt.range(5, 1, 3))).toEqual([])
  })
})

test('mean', () => {
  expect(itt.mean([1, 2, 3, 4])).toBe(2.5)
  expect(itt.mean([])).toBe(NaN)
  expect(itt([1, 2, 3]).mean()).toBe(2)
  expect(itt(function*(){}()).mean()).toBe(NaN)
})
