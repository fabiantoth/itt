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

test('mean', () => {
  expect(itt.mean([1, 2, 3, 4])).toBe(2.5)
  expect(itt.mean([])).toBe(NaN)
  expect(itt([1, 2, 3]).mean()).toBe(2)
  expect(itt(function*(){}()).mean()).toBe(NaN)
})
