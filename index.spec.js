const itt = require('.')

function* I(...els) {yield* els}
// istanbul ignore next
function fail() {throw new Error('Should never be called')}

describe('is', () => {
  it('rejects non-iterators', () => {
    expect(itt.is(1)).toBe(false)
    expect(itt.is({})).toBe(false)
    expect(itt.is(Object)).toBe(false)
  })
  it('accepts iterables', () => {
    expect(itt.is('test')).toBe(true)
    expect(itt.is([1, 2, 3])).toBe(true)
  })
  it('accepts iterators', () => {
    expect(itt.is('test'[Symbol.iterator]())).toBe(true)
    expect(itt.is([1, 2, 3][Symbol.iterator]())).toBe(true)
    expect(itt.is(I(0, 1, 2, 3, 4))).toBe(true)
  })
})

describe('generator', () => {
  it('returns a wrapped generator', () => {
    expect(itt.generator(function*() {})().toArray).toBeDefined()
  })
  it('forwards arguments', () => {
    const g = itt.generator(function*(a = 1, b = 2) {
      yield a
      yield b
    })
    expect(Array.from(g())).toEqual([1, 2])
    expect(Array.from(g(3))).toEqual([3, 2])
    expect(Array.from(g(3, 4))).toEqual([3, 4])
  })
})

describe('from', () => {
  it('can be used as itt(..)', () => {
    expect(itt([1, 2, 3, 4]).toArray).toBeDefined()
  })
  it('can be used as itt.from(...)', () => {
    expect(itt.from([1, 2, 3, 4]).toArray).toBeDefined()
  })
})

describe('empty', () => {
  it('returns wrapped iterators', () => {
    expect(itt.empty().toArray).toBeDefined()
  })
  it('returns an empty iterator', () => {
    expect(itt.empty().next()).toEqual({value: undefined, done: true})
    expect(Array.from(itt.empty())).toEqual([])
  })
})

describe('range', () => {
  it('returns wrapped iterators', () => {
    expect(itt.range(5).toArray).toBeDefined()
  })
  it('yields 0, 1, ..., n-1 when given one argument', () => {
    expect(Array.from(itt.range(5))).toEqual([0, 1, 2, 3, 4])
    expect(Array.from(itt.range(10))).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(Array.from(itt.range(0))).toEqual([])
  })
  it('yields n, n+1, ..., m-1 when given two arguments', () => {
    expect(Array.from(itt.range(-2, 2))).toEqual([-2, -1, 0, 1])
    expect(Array.from(itt.range(1, 5))).toEqual([1, 2, 3, 4])
    expect(Array.from(itt.range(5, 5))).toEqual([])
    expect(Array.from(itt.range(5, 1))).toEqual([])
  })
  it('yields n, n+k, ..., m-k when given three arguments', () => {
    expect(Array.from(itt.range(4, 13, 3))).toEqual([4, 7, 10])
    expect(Array.from(itt.range(5, -5, -1))).toEqual([5, 4, 3, 2, 1, 0, -1, -2, -3, -4])
    expect(Array.from(itt.range(5, -5, -2))).toEqual([5, 3, 1, -1, -3])
    expect(Array.from(itt.range(-5, 10, -1))).toEqual([])
    expect(Array.from(itt.range(5, 5, 3))).toEqual([])
    expect(Array.from(itt.range(5, 5, -3))).toEqual([])
    expect(Array.from(itt.range(5, 1, 3))).toEqual([])
  })
})

describe('split', () => {
  it('returns wrapped iterators', () => {
    expect(itt.split('1,2,3', ',').toArray).toBeDefined()
  })
  it('yields the input string when given one argument', () => {
    expect(Array.from(itt.split('1,2,3'))).toEqual(['1,2,3'])
    expect(Array.from(itt.split('ab cde fghi jkl mnop'))).toEqual(['ab cde fghi jkl mnop'])
    expect(Array.from(itt.split('aundefinedb'))).toEqual(['aundefinedb'])
    expect(Array.from(itt.split(''))).toEqual([''])
  })
  it('yields subsequences split at each occurrence of the separator', () => {
    expect(Array.from(itt.split('1,2,3', ','))).toEqual(['1', '2', '3'])
    expect(Array.from(itt.split('ab cde fghi jkl mnop', ' '))).toEqual(['ab', 'cde', 'fghi', 'jkl', 'mnop'])
  })
  it('stringifies its argument', () => {
    expect(Array.from(itt.split(0.1, '.'))).toEqual(['0', '1'])
  })
  it('supports regular expressions as separators', () => {
    expect(Array.from(itt.split('ab1cde2f3', /\d/))).toEqual(['ab', 'cde', 'f', ''])
    expect(Array.from(itt.split('test<reg>the<exp>world', /<\w+>/))).toEqual(['test', 'the', 'world'])
    expect(Array.from(itt.split('1a,.', /a?/))).toEqual(['1', ',', '.'])
    expect(Array.from(itt.split('1aa.', /a?/))).toEqual(['1', '', '.'])
    expect(Array.from(itt.split('1aaa.', /a?/))).toEqual(['1', '', '', '.'])
    expect(Array.from(itt.split('11aa..', /a?/))).toEqual(['1', '1', '', '.', '.'])
  })
  it('supports global regular expressions as separators', () => {
    expect(Array.from(itt.split('1,2,3', /,/g))).toEqual(['1', '2', '3'])
  })
  it('supports sticky regular expressions as separators', () => {
    expect(Array.from(itt.split('1,2,3', /,/y))).toEqual(['1', '2', '3'])
  })
  it('supports case-insensitive regular expressions as separators', () => {
    expect(Array.from(itt.split('1a2A3', /a/i))).toEqual(['1', '2', '3'])
  })
  it('supports Unicode regular expressions as separators', () => {
    expect(Array.from(itt.split('1𐠂2𐠃3', /[𐠂𐠃]/u))).toEqual(['1', '2', '3'])
    expect(Array.from(itt.split('1S2ſ3', /s/ui))).toEqual(['1', '2', '3'])
  })
  it('yields captured groups from regular expression separators', () => {
    expect(Array.from(itt.split('ab1cde2f3', /(\d)/))).toEqual(['ab', '1', 'cde', '2', 'f', '3', ''])
    expect(Array.from(itt.split('test<:reg>the<:exp>world', /(<):(\w+)>/))).toEqual(['test', '<', 'reg', 'the', '<', 'exp', 'world'])
    expect(Array.from(itt.split('1a,.', /()/))).toEqual(['1', '', 'a', '', ',', '', '.'])
    expect(Array.from(itt.split('1a,.', /()?/))).toEqual(['1', undefined, 'a', undefined, ',', undefined, '.'])
    expect(Array.from(itt.split('11aa..', /(a)?/))).toEqual(['1', undefined, '1', 'a', '', 'a', '.', undefined, '.'])
    expect(Array.from(itt.split('aa', /(a)?/))).toEqual(['', 'a', '', 'a', ''])
    expect(Array.from(itt.split('aab', /(a)?/))).toEqual(['', 'a', '', 'a', 'b'])
    expect(Array.from(itt.split('baa', /(a)?/))).toEqual(['b', 'a', '', 'a', ''])
    expect(Array.from(itt.split('bbabab', /(a)?/))).toEqual(['b', undefined, 'b', 'a', 'b', 'a', 'b'])
  })
  it('yields "" where two instances of the separator are adjacent', () => {
    expect(Array.from(itt.split('1,,2,,,3', ','))).toEqual(['1', '', '2', '', '', '3'])
    expect(Array.from(itt.split('ab    cde', ' '))).toEqual(['ab', '', '', '', 'cde'])
  })
  it('yields "" for leading separators', () => {
    expect(Array.from(itt.split(',,a,b,c', ','))).toEqual(['', '', 'a', 'b', 'c'])
    expect(Array.from(itt.split(' 123', ' '))).toEqual(['', '123'])
  })
  it('yields "" for trailing separators', () => {
    expect(Array.from(itt.split('a,b,c,,,', ','))).toEqual(['a', 'b', 'c', '', '', ''])
    expect(Array.from(itt.split('123 ', ' '))).toEqual(['123', ''])
  })
  it('returns an empty iterator for an empty string and an empty separator', () => {
    expect(Array.from(itt.split('', ''))).toEqual([])
    expect(Array.from(itt.split('', /a?/))).toEqual([])
    expect(Array.from(itt.split('', /^/))).toEqual([])
  })
  it('yields "" for an empty string and a non-empty separator', () => {
    expect(Array.from(itt.split('', ' '))).toEqual([''])
    expect(Array.from(itt.split('', 'asdf'))).toEqual([''])
    expect(Array.from(itt.split('', /a/))).toEqual([''])
  })
  it('yields each character when the separator is empty', () => {
    expect(Array.from(itt.split('a,b,c', ''))).toEqual(['a', ',', 'b', ',', 'c'])
    expect(Array.from(itt.split('1a,.', ''))).toEqual(['1', 'a', ',', '.'])
  })
  it('yields the input string when the separator does not occur', () => {
    expect(Array.from(itt.split('123abc', ','))).toEqual(['123abc'])
    expect(Array.from(itt.split('abcdefg', ' '))).toEqual(['abcdefg'])
    expect(Array.from(itt.split('abcdefg', /\d+/))).toEqual(['abcdefg'])
    expect(Array.from(itt.split('-1--2->', '-->'))).toEqual(['-1--2->'])
  })
  it('works for multi-character separators', () => {
    expect(Array.from(itt.split('-1--2->3-->4>--5-->6', '-->'))).toEqual(['-1--2->3', '4>--5', '6'])
  })
  it('yields the first n subsequences when given a limit', () => {
    expect(Array.from(itt.split('aundefinedb', undefined, 1))).toEqual(['aundefinedb'])
    expect(Array.from(itt.split('abcdef', '', 1))).toEqual(['a'])
    expect(Array.from(itt.split('abcdef', '', 2))).toEqual(['a', 'b'])
    expect(Array.from(itt.split('abcdef', '', 3))).toEqual(['a', 'b', 'c'])
    expect(Array.from(itt.split('abcdef', '', 10))).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(Array.from(itt.split('abcdef', '', Infinity))).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    expect(Array.from(itt.split('ab cde fghi jkl mnop', ' ', 1))).toEqual(['ab'])
    expect(Array.from(itt.split('ab cde fghi jkl mnop', ' ', 2))).toEqual(['ab', 'cde'])
    expect(Array.from(itt.split('ab cde fghi jkl mnop', ' ', 4))).toEqual(['ab', 'cde', 'fghi', 'jkl'])
    expect(Array.from(itt.split('ab cde fghi jkl mnop', ' ', 10))).toEqual(['ab', 'cde', 'fghi', 'jkl', 'mnop'])
    expect(Array.from(itt.split('ab cde fghi jkl mnop', ' ', Infinity))).toEqual(['ab', 'cde', 'fghi', 'jkl', 'mnop'])
    expect(Array.from(itt.split('abcdef', /(?=\w)/, 1))).toEqual(['a'])
  })
  it('supports @@split', () => {
    const pattern = {*[Symbol.split](string, limit) {
      yield {pattern: this, string, limit}
    }}
    expect(Array.from(itt.split('string', pattern, 10))).toEqual([{
      pattern,
      string: 'string',
      limit: 10,
    }])
  })
  it('yields the first n elements when given a regexp and a limit', () => {
    expect(Array.from(itt.split('1,2.3,4', /[,.]/, 3))).toEqual(['1', '2', '3'])
    expect(Array.from(itt.split('1,2.3,4', /[,.]/, 10))).toEqual(['1', '2', '3', '4'])
    expect(Array.from(itt.split('bbabababab', /(a)/, 1))).toEqual(['bb'])
    expect(Array.from(itt.split('bbabababab', /(a)/, 2))).toEqual(['bb', 'a'])
    expect(Array.from(itt.split('bbabababab', /(a)/, 3))).toEqual(['bb', 'a', 'b'])
    expect(Array.from(itt.split('bbabababab', /(a)/, 4))).toEqual(['bb', 'a', 'b', 'a'])
    expect(Array.from(itt.split('abcdefg', /(.)()?/, 4))).toEqual(['', 'a', undefined, ''])
    expect(Array.from(itt.split('abcdefg', /(.)()?/, 8))).toEqual(['', 'a', undefined, '', 'b', undefined, '', 'c'])
    expect(Array.from(itt.split('abcdefg', /(.)()?/, 100))).toEqual([
      '', 'a', undefined,
      '', 'b', undefined,
      '', 'c', undefined,
      '', 'd', undefined,
      '', 'e', undefined,
      '', 'f', undefined,
      '', 'g', undefined,
      '',
    ])
  })
  it('returns an empty iterator for n <= 0', () => {
    expect(Array.from(itt.split('abcdef', '', 0))).toEqual([])
    expect(Array.from(itt.split('abcdef', '', -1))).toEqual([])
    expect(Array.from(itt.split('aundefinedb', undefined, 0))).toEqual([])
    expect(Array.from(itt.split('aundefinedb', undefined, -1))).toEqual([])
    expect(Array.from(itt.split('ab cde fghi jkl mnop', ' ', 0))).toEqual([])
    expect(Array.from(itt.split('ab cde fghi jkl mnop', ' ', -1))).toEqual([])
  })
})

describe('irange', () => {
  it('returns wrapped iterators', () => {
    expect(itt.irange().toArray).toBeDefined()
  })
  it('yields 0, 1, 2, ... when given no arguments', () => {
    const i = itt.irange()
    for (let value = 0; value < 10; ++value) {
      expect(i.next()).toEqual({value, done: false})
    }
  })
  it('yields n, n+1, n+2, ... when given one argument', () => {
    const i = itt.irange(5)
    for (let value = 5; value < 15; ++value) {
      expect(i.next()).toEqual({value, done: false})
    }
  })
  it('yields n, n+k, n+2k, ... when given two arguments', () => {
    const i = itt.irange(5, -1)
    for (let value = 5; value > -5; --value) {
      expect(i.next()).toEqual({value, done: false})
    }
  })
})

describe('replicate', () => {
  it('returns wrapped iterators', () => {
    expect(itt.irange().toArray).toBeDefined()
  })
  it('yields x n times', () => {
    expect(Array.from(itt.replicate(10, 3))).toEqual([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])
  })
  it('is empty if n <= 0', () => {
    expect(Array.from(itt.replicate(0, 3))).toEqual([])
    expect(Array.from(itt.replicate(-1, 3))).toEqual([])
  })
})

describe('forever', () => {
  it('returns wrapped iterators', () => {
    expect(itt.forever().toArray).toBeDefined()
  })
  it('yields its argument forever', () => {
    const i = itt.forever('a')
    for (let n = 20; n--;) {
      expect(i.next()).toEqual({value: 'a', done: false})
    }
  })
})

describe('iterate', () => {
  it('returns wrapped iterators', () => {
    expect(itt.iterate().toArray).toBeDefined()
  })
  it('yields the initial value first', () => {
    expect(itt.iterate(1, x => x + 1).next()).toEqual({value: 1, done: false})
  })
  it('yields repeated applications of its input function', () => {
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

describe('cartesianProduct', () => {
  it('returns wrapped iterators', () => {
    expect(itt.cartesianProduct().toArray).toBeDefined()
  })
  it('returns an iterator of an empty array when given no arguments', () => {
    expect(Array.from(itt.cartesianProduct())).toEqual([[]])
    expect(Array.from(itt.cartesianProduct(0, []))).toEqual([[]])
    expect(Array.from(itt.cartesianProduct(-10, []))).toEqual([[]])
    expect(Array.from(itt.cartesianProduct(0, [1, 2]))).toEqual([[]])
    expect(Array.from(itt.cartesianProduct(-10, [1, 2, 3]))).toEqual([[]])
  })
  it('returns an empty iterator when one or more of the element arrays is empty', () => {
    expect(Array.from(itt.cartesianProduct([]))).toEqual([])
    expect(Array.from(itt.cartesianProduct([], [], [], []))).toEqual([])
    expect(Array.from(itt.cartesianProduct(I()))).toEqual([])
    expect(Array.from(itt.cartesianProduct(I(), I(), I(), I()))).toEqual([])
    expect(Array.from(itt.cartesianProduct([], [1, 2, 3], [4, 5, 6]))).toEqual([])
    expect(Array.from(itt.cartesianProduct([1, 2, 3], [4, 5, 6], []))).toEqual([])
    expect(Array.from(itt.cartesianProduct([1, 2, 3], [], [4, 5, 6], [7, 8, 9]))).toEqual([])
    expect(Array.from(itt.cartesianProduct([1, 2, 3], [], [4, 5, 6], [], [7, 8, 9]))).toEqual([])
    expect(Array.from(itt.cartesianProduct([1, 2, 3], I(), [4, 5, 6], I(), [7, 8, 9]))).toEqual([])
    expect(Array.from(itt.cartesianProduct(10, []))).toEqual([])
    expect(Array.from(itt.cartesianProduct(10, I()))).toEqual([])
  })
  it('yields distinct arrays', () => {
    const a = itt.cartesianProduct([1, 2, 3], [4, 5, 6])
    expect(a.next().value).not.toBe(a.next().value)
  })
  it('returns an iterator of products of each element array', () => {
    expect(new Set(itt.cartesianProduct([1, 2, 3]))).toEqual(new Set([[1], [2], [3]]))
    expect(new Set(itt.cartesianProduct(I(1, 2, 3)))).toEqual(new Set([[1], [2], [3]]))
    expect(new Set(itt.cartesianProduct([1, 2, 3], [4, 5, 6]))).toEqual(new Set([[1, 4], [1, 5], [1, 6], [2, 4], [2, 5], [2, 6], [3, 4], [3, 5], [3, 6]]))
    expect(new Set(itt.cartesianProduct([1, 2, 3], I(4, 5, 6)))).toEqual(new Set([[1, 4], [1, 5], [1, 6], [2, 4], [2, 5], [2, 6], [3, 4], [3, 5], [3, 6]]))
    expect(new Set(itt.cartesianProduct([1, 2], [3, 4], [5, 6], [7, 8, 9]))).toEqual(new Set([
      [1, 3, 5, 7], [1, 3, 5, 8], [1, 3, 5, 9], [1, 3, 6, 7], [1, 3, 6, 8], [1, 3, 6, 9],
      [1, 4, 5, 7], [1, 4, 5, 8], [1, 4, 5, 9], [1, 4, 6, 7], [1, 4, 6, 8], [1, 4, 6, 9],
      [2, 3, 5, 7], [2, 3, 5, 8], [2, 3, 5, 9], [2, 3, 6, 7], [2, 3, 6, 8], [2, 3, 6, 9],
      [2, 4, 5, 7], [2, 4, 5, 8], [2, 4, 5, 9], [2, 4, 6, 7], [2, 4, 6, 8], [2, 4, 6, 9],
    ]))
    expect(new Set(itt.cartesianProduct([1], [2], [3], [4, 5], [6], [7]))).toEqual(new Set([[1, 2, 3, 4, 6, 7], [1, 2, 3, 5, 6, 7]]))
  })
  it('steps through later elements first', () => {
    expect(Array.from(itt.cartesianProduct([1, 2], [3, 4], [5, 6]))).toEqual([[1, 3, 5], [1, 3, 6], [1, 4, 5], [1, 4, 6], [2, 3, 5], [2, 3, 6], [2, 4, 5], [2, 4, 6]])
    expect(Array.from(itt.cartesianProduct(3, [0, 1]))).toEqual([[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]])
  })
  it('returns an iterator of products of n copies of the element array when given n', () => {
    expect(new Set(itt.cartesianProduct(1, [1, 2, 3]))).toEqual(new Set([[1], [2], [3]]))
    expect(new Set(itt.cartesianProduct(4, [0, 1]))).toEqual(new Set([
      [0, 0, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0], [0, 0, 1, 1],
      [0, 1, 0, 0], [0, 1, 0, 1], [0, 1, 1, 0], [0, 1, 1, 1],
      [1, 0, 0, 0], [1, 0, 0, 1], [1, 0, 1, 0], [1, 0, 1, 1],
      [1, 1, 0, 0], [1, 1, 0, 1], [1, 1, 1, 0], [1, 1, 1, 1],
    ]))
  })
  it('works as a method', () => {
    expect(Array.from(itt([0, 1]).cartesianProduct(2))).toEqual([[0, 0], [0, 1], [1, 0], [1, 1]])
    expect(Array.from(itt([0, 1]).cartesianProduct([2, 3], [4, 5]))).toEqual([[0, 2, 4], [0, 2, 5], [0, 3, 4], [0, 3, 5], [1, 2, 4], [1, 2, 5], [1, 3, 4], [1, 3, 5]])
  })
})

describe('permutations', () => {
  it('returns wrapped iterators', () => {
    expect(itt.permutations([1, 2, 3]).toArray).toBeDefined()
  })
  it('works as a method', () => {
    expect(new Set(itt([0, 1, 2, 3, 4, 5]).permutations(1))).toEqual(new Set([[0], [1], [2], [3], [4], [5]]))
    expect(new Set(itt([3, 4, 5]).permutations())).toEqual(new Set([
      [3, 4, 5], [3, 5, 4],
      [4, 5, 3], [4, 3, 5],
      [5, 3, 4], [5, 4, 3],
    ]))
  })
  it('yields [] when given an empty iterator', () => {
    expect(Array.from(itt.permutations([]))).toEqual([[]])
    expect(Array.from(itt.permutations(I()))).toEqual([[]])
  })
  it('yields permutations of the given sequence', () => {
    expect(new Set(itt.permutations([0, 1, 2, 3]))).toEqual(new Set([
      [0, 1, 2, 3], [0, 1, 3, 2],
      [0, 2, 3, 1], [0, 2, 1, 3],
      [0, 3, 1, 2], [0, 3, 2, 1],

      [1, 2, 3, 0], [1, 2, 0, 3],
      [1, 3, 0, 2], [1, 3, 2, 0],
      [1, 0, 2, 3], [1, 0, 3, 2],

      [2, 3, 0, 1], [2, 3, 1, 0],
      [2, 0, 1, 3], [2, 0, 3, 1],
      [2, 1, 3, 0], [2, 1, 0, 3],

      [3, 0, 1, 2], [3, 0, 2, 1],
      [3, 1, 2, 0], [3, 1, 0, 2],
      [3, 2, 0, 1], [3, 2, 1, 0],
    ]))
  })
  it('yields permutations of the given sequence of length r when given r', () => {
    expect(new Set(itt.permutations(1, [0, 1, 2, 3, 4, 5]))).toEqual(new Set([[0], [1], [2], [3], [4], [5]]))
    expect(new Set(itt.permutations(2, [0, 1, 2, 3]))).toEqual(new Set([
      [0, 1], [0, 2], [0, 3],
      [1, 2], [1, 3], [1, 0],
      [2, 3], [2, 0], [2, 1],
      [3, 0], [3, 1], [3, 2],
    ]))
    expect(new Set(itt.permutations(2, [0, 1, 2, 3, 4]))).toEqual(new Set([
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 2], [1, 3], [1, 4], [1, 0],
      [2, 3], [2, 4], [2, 0], [2, 1],
      [3, 4], [3, 0], [3, 1], [3, 2],
      [4, 0], [4, 1], [4, 2], [4, 3],
    ]))
    expect(new Set(itt.permutations(3, [0, 1, 2, 3, 4]))).toEqual(new Set([
      [0, 1, 2], [0, 1, 3], [0, 1, 4],
      [0, 2, 3], [0, 2, 4], [0, 2, 1],
      [0, 3, 4], [0, 3, 1], [0, 3, 2],
      [0, 4, 1], [0, 4, 2], [0, 4, 3],

      [1, 2, 3], [1, 2, 4], [1, 2, 0],
      [1, 3, 4], [1, 3, 0], [1, 3, 2],
      [1, 4, 0], [1, 4, 2], [1, 4, 3],
      [1, 0, 2], [1, 0, 3], [1, 0, 4],

      [2, 3, 4], [2, 3, 0], [2, 3, 1],
      [2, 4, 0], [2, 4, 1], [2, 4, 3],
      [2, 0, 1], [2, 0, 3], [2, 0, 4],
      [2, 1, 3], [2, 1, 4], [2, 1, 0],

      [3, 4, 0], [3, 4, 1], [3, 4, 2],
      [3, 0, 1], [3, 0, 2], [3, 0, 4],
      [3, 1, 2], [3, 1, 4], [3, 1, 0],
      [3, 2, 4], [3, 2, 0], [3, 2, 1],

      [4, 0, 1], [4, 0, 2], [4, 0, 3],
      [4, 1, 2], [4, 1, 3], [4, 1, 0],
      [4, 2, 3], [4, 2, 0], [4, 2, 1],
      [4, 3, 0], [4, 3, 1], [4, 3, 2],
    ]))
  })
  it('yields [] when r = 0', () => {
    expect(Array.from(itt.permutations(0, []))).toEqual([[]])
    expect(Array.from(itt.permutations(0, I()))).toEqual([[]])
    expect(Array.from(itt.permutations(0, [1, 2, 3]))).toEqual([[]])
    expect(Array.from(itt.permutations(0, I(1, 2, 3)))).toEqual([[]])
  })
  it('yields no entries when r > n', () => {
    expect(Array.from(itt.permutations(5, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.permutations(2, [1]))).toEqual([])
    expect(Array.from(itt.permutations(2, I(1)))).toEqual([])
    expect(Array.from(itt.permutations(1, []))).toEqual([])
    expect(Array.from(itt.permutations(1, I()))).toEqual([])
    expect(Array.from(itt.permutations(3, []))).toEqual([])
    expect(Array.from(itt.permutations(3, I()))).toEqual([])
  })
})

describe('combinations', () => {
  it('returns wrapped iterators', () => {
    expect(itt.combinations(2, 'abcdef').toArray).toBeDefined()
  })
  it('works as a method', () => {
    expect(new Set(itt([1, 2, 3]).combinations())).toEqual(new Set([[1, 2, 3]]))
    expect(new Set(itt([1, 2, 3, 4]).combinations(2))).toEqual(new Set([
      [1, 2], [1, 3], [1, 4],
      [2, 3], [2, 4],
      [3, 4],
    ]))
  })
  it('yields [] when given an empty iterator', () => {
    expect(Array.from(itt.combinations([]))).toEqual([[]])
    expect(Array.from(itt.combinations(I()))).toEqual([[]])
  })
  it('returns an empty iterator when r > n', () => {
    expect(Array.from(itt.combinations(1, []))).toEqual([])
    expect(Array.from(itt.combinations(1, I()))).toEqual([])
    expect(Array.from(itt.combinations(2, [1]))).toEqual([])
    expect(Array.from(itt.combinations(2, I(1)))).toEqual([])
    expect(Array.from(itt.combinations(5, [4, 5, 6]))).toEqual([])
    expect(Array.from(itt.combinations(5, I(4, 5, 6)))).toEqual([])
  })
  it('yields combinations of the given sequence of length r in iteration order', () => {
    expect(new Set(itt.combinations(1, 'abcdef'))).toEqual(new Set([['a'], ['b'], ['c'], ['d'], ['e'], ['f']]))
    expect(new Set(itt.combinations(2, [0, 1, 2, 3, 4, 5, 6, 7]))).toEqual(new Set([
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
      [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
      [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
      [3, 4], [3, 5], [3, 6], [3, 7],
      [4, 5], [4, 6], [4, 7],
      [5, 6], [5, 7],
      [6, 7],
    ]))
    expect(new Set(itt.combinations(3, [0, 1, 2, 3, 4, 5]))).toEqual(new Set([
      [0, 1, 2], [0, 1, 3], [0, 1, 4], [0, 1, 5],
      [0, 2, 3], [0, 2, 4], [0, 2, 5],
      [0, 3, 4], [0, 3, 5],
      [0, 4, 5],
      [1, 2, 3], [1, 2, 4], [1, 2, 5],
      [1, 3, 4], [1, 3, 5],
      [1, 4, 5],
      [2, 3, 4], [2, 3, 5],
      [2, 4, 5],
      [3, 4, 5],
    ]))
    expect(new Set(itt.combinations(4, [0, 1, 2, 3, 4, 5]))).toEqual(new Set([
      [0, 1, 2, 3], [0, 1, 2, 4], [0, 1, 2, 5],
      [0, 1, 3, 4], [0, 1, 3, 5],
      [0, 1, 4, 5],
      [0, 2, 3, 4], [0, 2, 3, 5],
      [0, 2, 4, 5],
      [0, 3, 4, 5],
      [1, 2, 3, 4], [1, 2, 3, 5],
      [1, 2, 4, 5],
      [1, 3, 4, 5],
      [2, 3, 4, 5],
    ]))
    expect(new Set(itt.combinations(5, [0, 1, 2, 3, 4, 5, 6]))).toEqual(new Set([
      [0, 1, 2, 3, 4], [0, 1, 2, 3, 5], [0, 1, 2, 3, 6],
      [0, 1, 2, 4, 5], [0, 1, 2, 4, 6],
      [0, 1, 2, 5, 6],
      [0, 1, 3, 4, 5], [0, 1, 3, 4, 6],
      [0, 1, 3, 5, 6],
      [0, 1, 4, 5, 6],
      [0, 2, 3, 4, 5], [0, 2, 3, 4, 6],
      [0, 2, 3, 5, 6],
      [0, 2, 4, 5, 6],
      [0, 3, 4, 5, 6],
      [1, 2, 3, 4, 5], [1, 2, 3, 4, 6],
      [1, 2, 3, 5, 6],
      [1, 2, 4, 5, 6],
      [1, 3, 4, 5, 6],
      [2, 3, 4, 5, 6],
    ]))
    expect(new Set(itt.combinations(6, [0, 1, 2, 3, 4, 5, 6]))).toEqual(new Set([
      [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 6],
      [0, 1, 2, 3, 5, 6],
      [0, 1, 2, 4, 5, 6],
      [0, 1, 3, 4, 5, 6],
      [0, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
    ]))
    expect(new Set(itt.combinations(8, 'abcdefgh'))).toEqual(new Set([['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']]))
  })
})

describe('entries', () => {
  it('returns wrapped iterators', () => {
    expect(itt.entries({}).toArray).toBeDefined()
  })
  it('yields no entries for empty objects', () => {
    expect(Array.from(itt.entries({}))).toEqual([])
    expect(Array.from(itt.entries(Object.create(null)))).toEqual([])
    expect(Array.from(itt.entries(Object.create({a: 1, b: 2})))).toEqual([])
  })
  it(`yields its input object's own key/value entries`, () => {
    expect(Array.from(itt.entries({a: 1, b: 2, c: 3}))).toEqual([['a', 1], ['b', 2], ['c', 3]])
  })
  it('yields only own key/value entries', () => {
    expect(Array.from(itt.entries(Object.assign(Object.create({a: 1, b: 2, c: 3}), {d: 9, e: 8})))).toEqual([['d', 9], ['e', 8]])
  })
})

describe('keys', () => {
  it('returns wrapped iterators', () => {
    expect(itt.keys({}).toArray).toBeDefined()
  })
  it('yields no keys for empty objects', () => {
    expect(Array.from(itt.keys({}))).toEqual([])
    expect(Array.from(itt.keys(Object.create(null)))).toEqual([])
    expect(Array.from(itt.keys(Object.create({a: 1, b: 2})))).toEqual([])
  })
  it(`yields its input object's own keys`, () => {
    expect(Array.from(itt.keys({a: 1, b: 2, c: 3}))).toEqual(['a', 'b', 'c'])
  })
  it('yields only own keys', () => {
    expect(Array.from(itt.keys(Object.assign(Object.create({a: 1, b: 2, c: 3}), {d: 9, e: 8})))).toEqual(['d', 'e'])
  })
})

describe('values', () => {
  it('returns wrapped iterators', () => {
    expect(itt.values({}).toArray).toBeDefined()
  })
  it('yields no values for empty objects', () => {
    expect(Array.from(itt.values({}))).toEqual([])
    expect(Array.from(itt.values(Object.create(null)))).toEqual([])
    expect(Array.from(itt.values(Object.create({a: 1, b: 2})))).toEqual([])
  })
  it(`yields its input object's own values`, () => {
    expect(Array.from(itt.values({a: 1, b: 2, c: 3}))).toEqual([1, 2, 3])
  })
  it('yields only own values', () => {
    expect(Array.from(itt.values(Object.assign(Object.create({a: 1, b: 2, c: 3}), {d: 9, e: 8})))).toEqual([9, 8])
  })
})

describe('fork', () => {
  it('returns wrapped iterators', () => {
    const [a, b] = itt.fork([1, 2, 3])
    expect(a.toArray).toBeDefined()
    expect(b.toArray).toBeDefined()
    const [c, d] = itt([1, 2, 3]).fork()
    expect(c.toArray).toBeDefined()
    expect(d.toArray).toBeDefined()
  })
  it('returns two forks by default', () => {
    expect(itt.fork([1, 2, 3]).length).toBe(2)
    expect(itt([1, 2, 3]).fork().length).toBe(2)
  })
  it('returns n forks', () => {
    expect(itt.fork(1, [1, 2, 3]).length).toBe(1)
    expect(itt([1, 2, 3]).fork(1).length).toBe(1)
    expect(itt.fork(4, [1, 2, 3]).length).toBe(4)
    expect(itt([1, 2, 3]).fork(4).length).toBe(4)
  })
  it('returns no forks for n = 0', () => {
    expect(itt.fork(0, [1, 2, 3]).length).toBe(0)
    expect(itt([1, 2, 3]).fork(0).length).toBe(0)
  })
  it('returns independent iterators', () => {
    const [a, b, c] = itt.fork(3, I(1, 2, 3))
    expect(Array.from(a)).toEqual([1, 2, 3])
    expect(Array.from(b)).toEqual([1, 2, 3])
    expect(Array.from(c)).toEqual([1, 2, 3])

    const [d, e, f] = itt.fork(3, [1, 2, 3])
    expect(Array.from(d)).toEqual([1, 2, 3])
    expect(Array.from(e)).toEqual([1, 2, 3])
    expect(Array.from(f)).toEqual([1, 2, 3])

    const [g, h, i, j] = itt.fork(4, I(1, 2, 3))
    expect(Array.from(j)).toEqual([1, 2, 3])
    expect(Array.from(i)).toEqual([1, 2, 3])
    expect(Array.from(h)).toEqual([1, 2, 3])
    expect(Array.from(g)).toEqual([1, 2, 3])
  })
  it('discards values that have been iterated completely', () => {
    const [a, b, c] = itt.fork(3, I(1, 2, 3))
    c.next()
    b.next()
    a.next()
    expect(a.buffer).toEqual([])
    expect(b.buffer).toEqual([])
    expect(c.buffer).toEqual([])
  })
  it(`doesn't consume the iterator before any derived iterators are iterated`, () => {
    let it = false
    itt.fork(function*() {it = true; yield 1}())
    expect(it).toBe(false)
  })
})

describe('cycle', () => {
  it('returns wrapped iterators', () => {
    expect(itt.cycle([1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).cycle().toArray).toBeDefined()
  })
  it('cycles the iterator endlessly', () => {
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
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.cycle(function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('repeat', () => {
  it('returns wrapped iterators', () => {
    expect(itt.repeat(3, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).repeat(3).toArray).toBeDefined()
  })
  it('returns an empty iterator for n <= 0', () => {
    expect(Array.from(itt.repeat(0, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.repeat(-1, [1, 2, 3]))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.repeat(0, []))).toEqual([])
    expect(Array.from(itt.repeat(-1, []))).toEqual([])
    expect(Array.from(itt.repeat(5, []))).toEqual([])
    expect(Array.from(itt.repeat(100, []))).toEqual([])
    expect(Array.from(itt.repeat(100, I()))).toEqual([])
  })
  it('yields n copies of the iterator', () => {
    expect(Array.from(itt.repeat(3, [4, 5, 6]))).toEqual([4, 5, 6, 4, 5, 6, 4, 5, 6])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.repeat(2, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([4, 5, 6]).repeat(3))).toEqual([4, 5, 6, 4, 5, 6, 4, 5, 6])
  })
})

describe('enumerate', () => {
  it('returns wrapped iterators', () => {
    expect(itt.enumerate(['a', 'b', 'c']).toArray).toBeDefined()
    expect(itt(['a', 'b', 'c']).enumerate().toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.enumerate([]))).toEqual([])
    expect(Array.from(itt.enumerate(I()))).toEqual([])
  })
  it('yields pairs of indices and iterator elements', () => {
    expect(Array.from(itt.enumerate(['a', 'b', 'c', 'd']))).toEqual([[0, 'a'], [1, 'b'], [2, 'c'], [3, 'd']])
    expect(Array.from(itt.enumerate(I(5, 7, 10)))).toEqual([[0, 5], [1, 7], [2, 10]])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.enumerate(function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt(['a', 'b', 'c', 'd']).enumerate())).toEqual([[0, 'a'], [1, 'b'], [2, 'c'], [3, 'd']])
  })
})

describe('map', () => {
  it('returns wrapped iterators', () => {
    expect(itt.map(x => x + 1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).map(x => x + 1).toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator', () => {
    const f = jasmine.createSpy(), g = jasmine.createSpy()
    expect(Array.from(itt.map(f, []))).toEqual([])
    expect(Array.from(itt.map(g, I()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  it('applies fn to each element of the iterator', () => {
    expect(Array.from(itt.map(x => x * x, I(1, 2, 3)))).toEqual([1, 4, 9])
    expect(Array.from(itt.map(x => x + '!', ['cats', 'dogs', 'cows']))).toEqual(['cats!', 'dogs!', 'cows!'])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.map(x => x + 1, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt(['cats', 'dogs', 'cows']).map(x => x + '!'))).toEqual(['cats!', 'dogs!', 'cows!'])
  })
})

describe('flatMap', () => {
  it('returns wrapped iterators', () => {
    expect(itt.flatMap(x => [x, x], [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).map(x => [x, x]).toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator', () => {
    const f = jasmine.createSpy(), g = jasmine.createSpy()
    expect(Array.from(itt.flatMap(f, []))).toEqual([])
    expect(Array.from(itt.flatMap(g, I()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  it('applies fn to each element of the iterator and flattens the results', () => {
    expect(Array.from(itt.flatMap(x => [x, x + 1], [3, 5, 7]))).toEqual([3, 4, 5, 6, 7, 8])
  })
  it('accepts child iterators', () => {
    expect(Array.from(itt.flatMap(x => I(x, x * x), I(1, 2, 3)))).toEqual([1, 1, 2, 4, 3, 9])
  })
  it('ignores empty results', () => {
    expect(Array.from(itt.flatMap(x => x % 2 ? [] : [x * x * x], [9, 5, 2, 4, 7]))).toEqual([8, 64])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false, it4 = false
    const i = itt.flatMap(x => function*() {it3 = true; yield x; it4 = true; yield x}(), function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    expect(it3).toBe(false)
    i.next()
    expect(it2).toBe(false)
    expect(it4).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([3, 5, 7]).flatMap(x => [x, x + 1]))).toEqual([3, 4, 5, 6, 7, 8])
  })
})

describe('tap', () => {
  it('returns wrapped iterators', () => {
    expect(itt.tap(x => {}, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).tap(x => {}).toArray).toBeDefined()
  })
  it('returns its input iterator unchanged', () => {
    expect(Array.from(itt.tap(x => x + 1, [1, 3, 5, 7]))).toEqual([1, 3, 5, 7])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    const f = jasmine.createSpy(), g = jasmine.createSpy()
    expect(Array.from(itt.tap(f, []))).toEqual([])
    expect(Array.from(itt.tap(g, I()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  it('applies fn to each iterator element', () => {
    const res = []
    expect(Array.from(itt.tap(x => res.push(8 - x), [5, 6, 7]))).toEqual([5, 6, 7])
    expect(res).toEqual([3, 2, 1])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.tap(x => {}, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 3, 5, 7]).tap(x => x + 1))).toEqual([1, 3, 5, 7])
  })
})

describe('filter', () => {
  it('returns wrapped iterators', () => {
    expect(itt.filter(x => true, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).filter(x => true).toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator', () => {
    const f = jasmine.createSpy(), g = jasmine.createSpy()
    expect(Array.from(itt.filter(f, []))).toEqual([])
    expect(Array.from(itt.filter(g, I()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  it('yields only elements which satisfy fn', () => {
    expect(Array.from(itt.filter(x => x % 2, [9, 8, 6, 4, 5, 3, 1, 2]))).toEqual([9, 5, 3, 1])
  })
  it('returns an empty iterator when no elements satisfy fn', () => {
    expect(Array.from(itt.filter(x => false, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.filter(x => false, I(1, 2, 3)))).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false
    const i = itt.filter(x => !(x % 2), function*() {it1 = true; yield 1; it2 = true; yield 2; it3 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 2, done: false})
    expect(it1).toBe(true)
    expect(it2).toBe(true)
    expect(it3).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([9, 8, 6, 4, 5, 3, 1, 2]).filter(x => x % 2))).toEqual([9, 5, 3, 1])
  })
})

describe('reject', () => {
  it('returns wrapped iterators', () => {
    expect(itt.reject(x => false, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).reject(x => false).toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator', () => {
    const f = jasmine.createSpy(), g = jasmine.createSpy()
    expect(Array.from(itt.reject(f, []))).toEqual([])
    expect(Array.from(itt.reject(g, I()))).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  it(`yields only elements which don't satisfy fn`, () => {
    expect(Array.from(itt.reject(x => x % 2, [9, 8, 6, 4, 5, 3, 1, 2]))).toEqual([8, 6, 4, 2])
  })
  it('returns an empty iterator when every element satisfies fn', () => {
    expect(Array.from(itt.reject(x => true, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.reject(x => true, I(1, 2, 3)))).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false
    const i = itt.reject(x => x % 2, function*() {it1 = true; yield 1; it2 = true; yield 2; it3 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 2, done: false})
    expect(it1).toBe(true)
    expect(it2).toBe(true)
    expect(it3).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([9, 8, 6, 4, 5, 3, 1, 2]).reject(x => x % 2))).toEqual([8, 6, 4, 2])
  })
})

describe('partition', () => {
  it('returns wrapped iterators', () => {
    const [a, b] = itt.partition(x => false, [1, 2, 3])
    expect(a.toArray).toBeDefined()
    expect(b.toArray).toBeDefined()
  })
  it('returns two empty iterators when given an empty iterator', () => {
    const f = jasmine.createSpy(), g = jasmine.createSpy()
    const [a, b] = itt.partition(f, [])
    const [c, d] = itt.partition(g, I())
    expect(Array.from(a)).toEqual([])
    expect(Array.from(b)).toEqual([])
    expect(Array.from(c)).toEqual([])
    expect(Array.from(d)).toEqual([])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  it(`first iterator yields only elements which satisfy fn`, () => {
    const [, b] = itt.partition(x => x % 2, [9, 8, 6, 4, 5, 3, 1, 2])
    expect(Array.from(b)).toEqual([8, 6, 4, 2])
  })
  it(`second iterator yields only elements which don't satisfy fn`, () => {
    const [a, ] = itt.partition(x => x % 2, [9, 8, 6, 4, 5, 3, 1, 2])
    expect(Array.from(a)).toEqual([9, 5, 3, 1])
  })
  it('first iterator is empty when no elements satisfy fn', () => {
    const [a, ] = itt.partition(x => false, [1, 2, 3])
    const [b, ] = itt.partition(x => false, I(1, 2, 3))
    expect(Array.from(a)).toEqual([])
    expect(Array.from(b)).toEqual([])
  })
  it('second iterator is empty when every element satisfies fn', () => {
    const [, a] = itt.partition(x => true, [1, 2, 3])
    const [, b] = itt.partition(x => true, I(1, 2, 3))
    expect(Array.from(a)).toEqual([])
    expect(Array.from(a)).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false, it4 = false
    const [odd, even] = itt.partition(x => x % 2, function*() {it1 = true; yield 1; it2 = true; yield 2; it3 = true; yield 3; it4 = true}())
    expect(it1).toBe(false)
    expect(even.next()).toEqual({value: 2, done: false})
    expect(it1).toBe(true)
    expect(it2).toBe(true)
    expect(it3).toBe(false)
    expect(odd.next()).toEqual({value: 1, done: false})
    expect(it1).toBe(true)
    expect(it2).toBe(true)
    expect(it3).toBe(false)
    expect(odd.next()).toEqual({value: 3, done: false})
    expect(it3).toBe(true)
  })
  it('returns independent iterators', () => {
    const [a, b] = itt.partition(x => x % 2, [9, 8, 6, 4, 5, 3, 1, 1, 2])
    expect(Array.from(b).length).toEqual(4)
    expect(Array.from(a).length).toEqual(5)
    const [c, d] = itt.partition(x => x % 2, [9, 8, 6, 4, 5, 3, 1, 1, 2])
    expect(Array.from(c).length).toEqual(5)
    expect(Array.from(d).length).toEqual(4)
  })
  it('works as a method', () => {
    expect(Array.from(itt([9, 8, 6, 4, 5, 3, 1, 2]).partition(x => x % 2), x => Array.from(x))).toEqual([[9, 5, 3, 1], [8, 6, 4, 2]])
  })
})

describe('concat', () => {
  it('returns wrapped iterators', () => {
    expect(itt.concat([1, 2, 3], [4, 5, 6]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).concat([4, 5, 6]).toArray).toBeDefined()
  })
  it('returns an empty iterator when given no iterators', () => {
    expect(Array.from(itt.concat())).toEqual([])
  })
  it('returns an empty iterator when given all empty iterators', () => {
    expect(Array.from(itt.concat([], I(), []))).toEqual([])
  })
  it('yields the concatenation of its input iterators', () => {
    expect(Array.from(itt.concat([1, 2, 3]))).toEqual([1, 2, 3])
    expect(Array.from(itt.concat([1, 2, 3], I(4, 5), [6, 7]))).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
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
  it('works as a method', () => {
    expect(Array.from(itt.concat([1, 2, 3], [4, 5], [6, 7, 8]))).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })
})

describe('push', () => {
  it('returns wrapped iterators', () => {
    expect(itt.push(4, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).push(4).toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator and no elements', () => {
    expect(Array.from(itt.push([]))).toEqual([])
    expect(Array.from(itt.push(I()))).toEqual([])
  })
  it('yields just the extra elements when given an empty iterator', () => {
    expect(Array.from(itt.push(1, []))).toEqual([1])
    expect(Array.from(itt.push(1, I()))).toEqual([1])
  })
  it('yields just the iterator elements when given no extra elements', () => {
    expect(Array.from(itt.push([1, 2, 3]))).toEqual([1, 2, 3])
  })
  it('yields the extra elements in argument order', () => {
    expect(Array.from(itt.push(4, 5, 6, [1, 2, 3]))).toEqual([1, 2, 3, 4, 5, 6])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.push(3, 4, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3]).push(4, 5, 6))).toEqual([1, 2, 3, 4, 5, 6])
  })
})

describe('unshift', () => {
  it('returns wrapped iterators', () => {
    expect(itt.unshift(4, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).unshift(4).toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator and no elements', () => {
    expect(Array.from(itt.unshift([]))).toEqual([])
    expect(Array.from(itt.unshift(I()))).toEqual([])
  })
  it('yields just the extra elements when given an empty iterator', () => {
    expect(Array.from(itt.unshift(1, []))).toEqual([1])
    expect(Array.from(itt.unshift(1, I()))).toEqual([1])
  })
  it('yields just the iterator elements when given no extra elements', () => {
    expect(Array.from(itt.unshift([1, 2, 3]))).toEqual([1, 2, 3])
  })
  it('yields the extra elements in argument order', () => {
    expect(Array.from(itt.unshift(4, 5, 6, [1, 2, 3]))).toEqual([4, 5, 6, 1, 2, 3])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
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
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3]).unshift(4, 5, 6))).toEqual([4, 5, 6, 1, 2, 3])
  })
})

describe('flatten', () => {
  it('returns wrapped iterators', () => {
    expect(itt.flatten([[1, 2, 3], [4, 5, 6]]).toArray).toBeDefined()
    expect(itt([[1, 2, 3], [4, 5, 6]]).flatten().toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.flatten([]))).toEqual([])
    expect(Array.from(itt.flatten(I(), []))).toEqual([])
  })
  it('returns an empty iterator when given all empty child iterators', () => {
    expect(Array.from(itt.flatten([[], I(), []]))).toEqual([])
  })
  it('yields the concatenation of each element of its input iterators', () => {
    expect(Array.from(itt.flatten([[1, 2, 3]]))).toEqual([1, 2, 3])
    expect(Array.from(itt.flatten([[1, 2, 3], I(4, 5), [6, 7]]))).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
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
  it('works as a method', () => {
    expect(Array.from(itt([[1, 2, 3]]).flatten())).toEqual([1, 2, 3])
  })
})

describe('chunksBy', () => {
  function sameParity(x, y) {
    return (x % 2) === (y % 2)
  }
  function sameType(x, y) {
    return typeof x === typeof y
  }
  it('returns wrapped iterators', () => {
    expect(itt.chunksBy(sameParity, [1, 3, 5, 4, 6, 9]).toArray).toBeDefined()
    expect(itt([1, 3, 5, 4, 6, 9]).chunksBy(sameParity).toArray).toBeDefined()
  })
  it('yields distinct arrays', () => {
    const a = itt.chunksBy(sameParity, [1, 3, 5, 6, 8, 10])
    expect(a.next().value).not.toBe(a.next().value)
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.chunksBy(sameParity, []))).toEqual([])
    expect(Array.from(itt.chunksBy(sameParity, I()))).toEqual([])
  })
  it('groups items together for which f returns true', () => {
    expect(Array.from(itt([1, 1, 2, 3, 5, 8, 13, 21]).chunksBy(sameParity))).toEqual([[1, 1], [2], [3, 5], [8], [13, 21]])
    expect(Array.from(itt([Object, 1, 2, 3, 'a', 'b', 'c', Function, String, 'd', 'e', 4, 5, 'f', Math]).chunksBy(sameType))).toEqual([
      [Object], [1, 2, 3], ['a', 'b', 'c'], [Function, String], ['d', 'e'], [4, 5], ['f'], [Math]])
  })
  it('passes the current chunk prefix as the third argument to f', () => {
    expect(Array.from(itt([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]).chunksBy((_1, _2, l) => l.length < 3))).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9], [0]])
    expect(Array.from(itt([1, 1, 1, 2, 3, 9, 9, 10, 100, 101, 101, 200]).chunksBy((x, _, l) => x <= itt.sum(l))))
      .toEqual([[1, 1, 1, 2, 3], [9, 9, 10], [100], [101, 101, 200]])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.chunksBy(sameParity, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: [1], done: false})
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 3, 5, 6, 8, 9, 10, 12]).chunksBy(sameParity))).toEqual([[1, 3, 5], [6, 8], [9], [10, 12]])
  })
})

describe('chunksOf', () => {
  it('returns wrapped iterators', () => {
    expect(itt.chunksOf(2, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).chunksOf(2).toArray).toBeDefined()
  })
  it('defaults to subsequences of 2', () => {
    expect(Array.from(itt.chunksOf([1, 2, 3, 4]))).toEqual([[1, 2], [3, 4]])
    expect(Array.from(itt([1, 2, 3, 4]).chunksOf())).toEqual([[1, 2], [3, 4]])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.chunksOf(2, []))).toEqual([])
    expect(Array.from(itt.chunksOf(5, I()))).toEqual([])
  })
  it('yields distinct arrays', () => {
    const a = itt.chunksOf(3, [1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(a.next().value).not.toBe(a.next().value)
  })
  it('yields chunks of n items', () => {
    expect(Array.from(itt.chunksOf(3, [1, 2, 3, 4, 5, 6, 7, 8, 9]))).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    expect(Array.from(itt.chunksOf(1, [1, 2, 3, 4, 5, 6, 7, 8, 9]))).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9]])
  })
  it(`yields fewer items in the last chunk if there aren't an even number of elements`, () => {
    expect(Array.from(itt.chunksOf(3, [1, 2, 3, 4]))).toEqual([[1, 2, 3], [4]])
    expect(Array.from(itt.chunksOf(3, [1, 2, 3, 4, 5]))).toEqual([[1, 2, 3], [4, 5]])
  })
  it(`yields the entire iterator if there are not more than n elements`, () => {
    expect(Array.from(itt.chunksOf(4, [1, 2, 3, 4]))).toEqual([[1, 2, 3, 4]])
    expect(Array.from(itt.chunksOf(10, [1, 2]))).toEqual([[1, 2]])
    expect(Array.from(itt.chunksOf(10, [9]))).toEqual([[9]])
  })
  it('returns an empty iterator if n <= 0', () => {
    expect(Array.from(itt.chunksOf(0, [1, 2, 3, 4]))).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.chunksOf(2, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: [1, 2], done: false})
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3, 4, 5, 6, 7, 8, 9]).chunksOf(3))).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
  })
})

describe('subsequences', () => {
  it('returns wrapped iterators', () => {
    expect(itt.subsequences(2, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).subsequences(2).toArray).toBeDefined()
  })
  it('defaults to subsequences of 2', () => {
    expect(Array.from(itt.subsequences([1, 2, 3, 4]))).toEqual([[1, 2], [2, 3], [3, 4]])
    expect(Array.from(itt([1, 2, 3, 4]).subsequences())).toEqual([[1, 2], [2, 3], [3, 4]])
  })
  it('yields distinct arrays', () => {
    const a = itt.subsequences(3, [1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(a.next().value).not.toBe(a.next().value)
  })
  it('yields subsequences of the iterator', () => {
    expect(Array.from(itt.subsequences(4, [1, 2, 3, 4, 5, 6]))).toEqual([[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]])
    expect(Array.from(itt.subsequences(4, [1, 2, 3, 4]))).toEqual([[1, 2, 3, 4]])
    expect(Array.from(itt.subsequences(1, [1, 2, 3, 4]))).toEqual([[1], [2], [3], [4]])
  })
  it(`returns an empty iterator when there aren't enough elements`, () => {
    expect(Array.from(itt.subsequences(5, [1, 2, 3, 4]))).toEqual([])
    expect(Array.from(itt.subsequences(5, [1]))).toEqual([])
    expect(Array.from(itt.subsequences(2, [1]))).toEqual([])
  })
  it('returns an empty iterator if n <= 0', () => {
    expect(Array.from(itt.subsequences(0, [1, 2, 3, 4]))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.subsequences(2, []))).toEqual([])
    expect(Array.from(itt.subsequences(5, I()))).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.subsequences(2, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: [1, 2], done: false})
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3, 4, 5, 6]).subsequences(4))).toEqual([[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]])
  })
})

describe('lookahead', () => {
  it('returns wrapped iterators', () => {
    expect(itt.lookahead(1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).lookahead(1).toArray).toBeDefined()
  })
  it('defaults to lookahead of 1', () => {
    expect(Array.from(itt.lookahead([1, 2, 3, 4]))).toEqual([[1, 2], [2, 3], [3, 4], [4]])
    expect(Array.from(itt([1, 2, 3, 4]).lookahead())).toEqual([[1, 2], [2, 3], [3, 4], [4]])
  })
  it('yields distinct arrays', () => {
    const a = itt.lookahead(3, [1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(a.next().value).not.toBe(a.next().value)
  })
  it('yields n lookahead elements', () => {
    expect(Array.from(itt.lookahead(3, [1, 2, 3, 4, 5, 6]))).toEqual([[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6], [4, 5, 6], [5, 6], [6]])
    expect(Array.from(itt.lookahead(3, [1, 2, 3, 4]))).toEqual([[1, 2, 3, 4], [2, 3, 4], [3, 4], [4]])
    expect(Array.from(itt.lookahead(1, [1, 2, 3, 4]))).toEqual([[1, 2], [2, 3], [3, 4], [4]])
    expect(Array.from(itt.lookahead(3, [1, 2]))).toEqual([[1, 2], [2]])
    expect(Array.from(itt.lookahead(4, [1]))).toEqual([[1]])
  })
  it('yields no lookahead if n <= 0', () => {
    expect(Array.from(itt.lookahead(0, [1, 2, 3, 4]))).toEqual([[1], [2], [3], [4]])
  })
  it('works on bare iterators', () => {
    const inner = [1, 2, 3, 4][Symbol.iterator]()
    const it = {next: inner.next.bind(inner)}
    expect(Array.from(itt.lookahead(it))).toEqual([[1, 2], [2, 3], [3, 4], [4]])
    const inner2 = [1, 2, 3, 4][Symbol.iterator]()
    const it2 = {next: inner2.next.bind(inner2)}
    expect(Array.from(itt.lookahead(2, it2))).toEqual([[1, 2, 3], [2, 3, 4], [3, 4], [4]])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.lookahead(2, []))).toEqual([])
    expect(Array.from(itt.lookahead(5, I()))).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.lookahead(1, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: [1, 2], done: false})
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3, 4]).lookahead(1))).toEqual([[1, 2], [2, 3], [3, 4], [4]])
  })
})

describe('drop', () => {
  it('returns wrapped iterators', () => {
    expect(itt.drop(1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).drop(1).toArray).toBeDefined()
  })
  it('yields all but the first n elements', () => {
    expect(Array.from(itt.drop(2, [1, 2, 3, 4, 5, 6]))).toEqual([3, 4, 5, 6])
    expect(Array.from(itt.drop(1, I(3, 2, 1)))).toEqual([2, 1])
  })
  it(`yields all elements if n <= 0`, () => {
    expect(Array.from(itt.drop(-5, [1, 2, 3, 4, 5]))).toEqual([1, 2, 3, 4, 5])
    expect(Array.from(itt.drop(0, [1, 2, 3]))).toEqual([1, 2, 3])
  })
  it(`returns an empty iterator if there aren't enough elements`, () => {
    expect(Array.from(itt.drop(5, [1, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.drop(3, [1]))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.drop(2, []))).toEqual([])
    expect(Array.from(itt.drop(5, I()))).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.drop(1, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 2, done: false})
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3, 4, 5, 6]).drop(2))).toEqual([3, 4, 5, 6])
  })
})

describe('dropWhile', () => {
  it('returns wrapped iterators', () => {
    expect(itt.dropWhile(n => n < 3, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).dropWhile(n => n < 3).toArray).toBeDefined()
  })
  it('yields all but the initial elements that satisfy fn', () => {
    expect(Array.from(itt.dropWhile(n => n % 2, [1, 3, 4, 5, 6, 7]))).toEqual([4, 5, 6, 7])
    expect(Array.from(itt.dropWhile(n => n > 1, I(3, 2, 1, 4)))).toEqual([1, 4])
  })
  it(`yields all elements if no initial elements satisfy fn`, () => {
    expect(Array.from(itt.dropWhile(n => n % 2, [4, 2, 3, 4, 5]))).toEqual([4, 2, 3, 4, 5])
    expect(Array.from(itt.dropWhile(n => n % 2, [4, 2, 3]))).toEqual([4, 2, 3])
  })
  it(`returns an empty iterator if all elements satisfy fn`, () => {
    expect(Array.from(itt.dropWhile(n => n < 10, [1, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.dropWhile(n => true, [1]))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.dropWhile(n => false, []))).toEqual([])
    expect(Array.from(itt.dropWhile(n => false, I()))).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.dropWhile(n => n <= 1, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 2, done: false})
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 3, 4, 5, 6, 7]).dropWhile(n => n % 2))).toEqual([4, 5, 6, 7])
  })
})

describe('dropLast', () => {
  it('returns wrapped iterators', () => {
    expect(itt.dropLast(1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).dropLast(1).toArray).toBeDefined()
  })
  it('yields all but the last n elements', () => {
    expect(Array.from(itt.dropLast(1, [1, 2, 3, 4, 5, 6]))).toEqual([1, 2, 3, 4, 5])
    expect(Array.from(itt.dropLast(3, [1, 2, 3, 4, 5, 6]))).toEqual([1, 2, 3])
    expect(Array.from(itt.dropLast(1, I(3, 2, 1)))).toEqual([3, 2])
  })
  it(`yields all elements if n <= 0`, () => {
    expect(Array.from(itt.dropLast(-5, [1, 2, 3, 4, 5]))).toEqual([1, 2, 3, 4, 5])
    expect(Array.from(itt.dropLast(0, [1, 2, 3]))).toEqual([1, 2, 3])
  })
  it(`returns an empty iterator if there aren't enough elements`, () => {
    expect(Array.from(itt.dropLast(5, [1, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.dropLast(3, [1]))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.dropLast(2, []))).toEqual([])
    expect(Array.from(itt.dropLast(5, I()))).toEqual([])
  })
  it(`doesn't consume elements until necessary`, () => {
    let it1 = false, it2 = false
    const i = itt.dropLast(1, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 1, done: false})
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3, 4, 5, 6]).dropLast(1))).toEqual([1, 2, 3, 4, 5])
  })
})

describe('take', () => {
  it('returns wrapped iterators', () => {
    expect(itt.take(1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).take(1).toArray).toBeDefined()
  })
  it('yields the first n elements', () => {
    expect(Array.from(itt.take(3, [1, 2, 3, 4, 5, 6]))).toEqual([1, 2, 3])
    expect(Array.from(itt.take(1, I(3, 2, 1)))).toEqual([3])
  })
  it(`yields all elements if there aren't more than n`, () => {
    expect(Array.from(itt.take(5, [1, 2, 3, 4, 5]))).toEqual([1, 2, 3, 4, 5])
    expect(Array.from(itt.take(3, [1]))).toEqual([1])
  })
  it(`returns an empty iterator if n <= 0`, () => {
    expect(Array.from(itt.take(0, [1, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.take(-100, [1]))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.take(2, []))).toEqual([])
    expect(Array.from(itt.take(5, I()))).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.take(1, function*() {it1 = true; yield 1; it2 = true; yield 2}())
    expect(it1).toBe(false)
    expect(i.next()).toEqual({value: 1, done: false})
    expect(i.next()).toEqual({value: undefined, done: true})
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3, 4, 5, 6]).take(3))).toEqual([1, 2, 3])
  })
})

describe('takeWhile', () => {
  it('returns wrapped iterators', () => {
    expect(itt.takeWhile(n => n < 3, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).takeWhile(n => n < 3).toArray).toBeDefined()
  })
  it('yields the initial elements that satisfy fn', () => {
    expect(Array.from(itt.takeWhile(n => n % 2, [1, 3, 4, 5, 6, 7]))).toEqual([1, 3])
    expect(Array.from(itt.takeWhile(n => n > 1, I(3, 2, 1, 4)))).toEqual([3, 2])
  })
  it(`returns an empty iterator if no elements satisfy fn`, () => {
    expect(Array.from(itt.takeWhile(n => n > 10, [1, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.takeWhile(n => false, [1]))).toEqual([])
  })
  it(`returns an empty iterator if no initial elements satisfy fn`, () => {
    expect(Array.from(itt.takeWhile(n => n % 2, [4, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.takeWhile(n => n % 2, [4, 2, 3]))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.takeWhile(n => true, []))).toEqual([])
    expect(Array.from(itt.takeWhile(n => true, I()))).toEqual([])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.takeWhile(n => n <= 1, function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 3, 4, 5, 6, 7]).takeWhile(n => n % 2))).toEqual([1, 3])
  })
})

describe('takeLast', () => {
  it('returns wrapped iterators', () => {
    expect(itt.takeLast(1, [1, 2, 3]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).takeLast(1).toArray).toBeDefined()
  })
  it('yields the last n elements', () => {
    expect(Array.from(itt.takeLast(1, [1, 2, 3, 4, 5, 6]))).toEqual([6])
    expect(Array.from(itt.takeLast(3, [1, 2, 3, 4, 5, 6]))).toEqual([4, 5, 6])
    expect(Array.from(itt.takeLast(1, I(3, 2, 1)))).toEqual([1])
  })
  it(`returns an empty iterator if n <= 0`, () => {
    expect(Array.from(itt.takeLast(-5, [1, 2, 3, 4, 5]))).toEqual([])
    expect(Array.from(itt.takeLast(0, [1, 2, 3]))).toEqual([])
  })
  it(`yields all elements if there aren't more than n`, () => {
    expect(Array.from(itt.takeLast(5, [1, 2, 3, 4, 5]))).toEqual([1, 2, 3, 4, 5])
    expect(Array.from(itt.takeLast(3, [1]))).toEqual([1])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.takeLast(2, []))).toEqual([])
    expect(Array.from(itt.takeLast(5, I()))).toEqual([])
  })
  it(`doesn't consume elements until necessary`, () => {
    let it1 = false, it2 = false
    const i = itt.takeLast(1, function*() {it1 = true; yield 1; yield 2; yield 3; it2 = true}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(true)
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3, 4, 5, 6]).takeLast(1))).toEqual([6])
  })
})

describe('transpose', () => {
  it('returns wrapped iterators', () => {
    expect(itt.transpose([[1, 2, 3], [4, 5, 6]]).toArray).toBeDefined()
    expect(itt([[1, 2, 3], [4, 5, 6]]).transpose().toArray).toBeDefined()
  })
  it(`yields arrays of elements from its argument's elements`, () => {
    expect(Array.from(itt.transpose([[1, 2, 3], [4, 5, 6]]))).toEqual([[1, 4], [2, 5], [3, 6]])
    expect(Array.from(itt.transpose([I(1, 2, 3), I(4, 5, 6)]))).toEqual([[1, 4], [2, 5], [3, 6]])
    expect(Array.from(itt.transpose([[1, 2], [3, 4], [5, 6], [7, 8]]))).toEqual([[1, 3, 5, 7], [2, 4, 6, 8]])
    expect(Array.from(itt.transpose(I([1, 2, 3], [4, 5, 6])))).toEqual([[1, 4], [2, 5], [3, 6]])
    expect(Array.from(itt.transpose(I([1, 2, 3])))).toEqual([[1], [2], [3]])
  })
  it('yields distinct arrays', () => {
    const a = itt.transpose([[1, 2, 3, 4], [5, 6, 7, 8]])
    expect(a.next().value).not.toBe(a.next().value)
  })
  it(`doesn't consume elements until necessary`, () => {
    let it1 = false, it2 = false
    const i = itt.transpose(function*() {it1 = true; yield [1, 2]; yield [3, 4]; yield [3, 4]; it2 = true}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(true)
  })
  it('stops when any iterator runs out of elements', () => {
    expect(Array.from(itt.transpose([[1, 2, 3, 4], [5, 6]]))).toEqual([[1, 5], [2, 6]])
    expect(Array.from(itt.transpose([[1], [2, 3, 4], [5, 6, 7, 8]]))).toEqual([[1, 2, 5]])
    expect(Array.from(itt.transpose([I(1, 2, 3, 4), I(5, 6)]))).toEqual([[1, 5], [2, 6]])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.transpose([]))).toEqual([])
    expect(Array.from(itt.transpose(I()))).toEqual([])
  })
  it('returns an empty iterator when given any empty iterator elements', () => {
    expect(Array.from(itt.transpose([[], [], []]))).toEqual([])
    expect(Array.from(itt.transpose([[1, 2, 3], I(4, 5, 6, 7, 8), I()]))).toEqual([])
    expect(Array.from(itt.transpose([[], [1], [2]]))).toEqual([])
    expect(Array.from(itt.transpose(I([])))).toEqual([])
  })
  it('works as a method', () => {
    expect(Array.from(itt([[1, 2, 3], [4, 5, 6]]).transpose())).toEqual([[1, 4], [2, 5], [3, 6]])
  })
})

describe('zip', () => {
  it('returns wrapped iterators', () => {
    expect(itt.zip([1, 2, 3], [4, 5, 6]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).zip([4, 5, 6]).toArray).toBeDefined()
  })
  it('yields distinct arrays', () => {
    const a = itt.zip([1, 2, 3, 4], [5, 6, 7, 8])
    expect(a.next().value).not.toBe(a.next().value)
  })
  it(`yields arrays of elements from its arguments`, () => {
    expect(Array.from(itt.zip([1, 2, 3], [4, 5, 6]))).toEqual([[1, 4], [2, 5], [3, 6]])
    expect(Array.from(itt.zip(I(1, 2, 3), I(4, 5, 6)))).toEqual([[1, 4], [2, 5], [3, 6]])
    expect(Array.from(itt.zip([1, 2], [3, 4], [5, 6], [7, 8]))).toEqual([[1, 3, 5, 7], [2, 4, 6, 8]])
    expect(Array.from(itt.zip([1, 2, 3]))).toEqual([[1], [2], [3]])
  })
  it('stops when any iterator runs out of elements', () => {
    expect(Array.from(itt.zip([1, 2, 3, 4], [5, 6]))).toEqual([[1, 5], [2, 6]])
    expect(Array.from(itt.zip([1], [2, 3, 4], [5, 6, 7, 8]))).toEqual([[1, 2, 5]])
    expect(Array.from(itt.zip(I(1, 2, 3, 4), I(5, 6)))).toEqual([[1, 5], [2, 6]])
  })
  it('returns an empty iterator when given no iterators', () => {
    expect(Array.from(itt.zip())).toEqual([])
  })
  it('returns an empty iterator when given any empty iterators', () => {
    expect(Array.from(itt.zip([], [], []))).toEqual([])
    expect(Array.from(itt.zip([1, 2, 3], [4, 5, 6, 7, 8], []))).toEqual([])
    expect(Array.from(itt.zip([1, 2, 3], I(4, 5, 6, 7, 8), I()))).toEqual([])
    expect(Array.from(itt.zip([], [1], [2]))).toEqual([])
    expect(Array.from(itt.zip([]))).toEqual([])
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3]).zip([4, 5, 6]))).toEqual([[1, 4], [2, 5], [3, 6]])
  })
})

describe('parallel', () => {
  it('returns wrapped iterators', () => {
    expect(itt.parallel([1, 2, 3], [4, 5, 6]).toArray).toBeDefined()
    expect(itt([1, 2, 3]).parallel([4, 5, 6]).toArray).toBeDefined()
  })
  it('yields distinct arrays', () => {
    const a = itt.parallel([1, 2, 3, 4], [5, 6, 7, 8])
    expect(a.next().value).not.toBe(a.next().value)
  })
  it(`yields arrays of elements from its arguments`, () => {
    expect(Array.from(itt.parallel([1, 2, 3], [4, 5, 6]))).toEqual([[1, 4], [2, 5], [3, 6]])
    expect(Array.from(itt.parallel(I(1, 2, 3), I(4, 5, 6)))).toEqual([[1, 4], [2, 5], [3, 6]])
    expect(Array.from(itt.parallel([1, 2], [3, 4], [5, 6], [7, 8]))).toEqual([[1, 3, 5, 7], [2, 4, 6, 8]])
    expect(Array.from(itt.parallel([1, 2, 3]))).toEqual([[1], [2], [3]])
  })
  it('stops when all iterators have run out of elements', () => {
    let u
    expect(Array.from(itt.parallel([1, 2, 3, 4], [5, 6]))).toEqual([[1, 5], [2, 6], [3, u], [4, u]])
    expect(Array.from(itt.parallel([1], [2, 3, 4], [5, 6, 7, 8]))).toEqual([[1, 2, 5], [u, 3, 6], [u, 4, 7], [u, u, 8]])
    expect(Array.from(itt.parallel(I(1, 2, 3, 4), I(5, 6)))).toEqual([[1, 5], [2, 6], [3, u], [4, u]])
    expect(Array.from(itt.parallel([1, 2, 3], [4, 5, 6, 7, 8], []))).toEqual([[1, 4, u], [2, 5, u], [3, 6, u], [u, 7, u], [u, 8, u]])
    expect(Array.from(itt.parallel([1, 2, 3], I(4, 5, 6, 7, 8), I()))).toEqual([[1, 4, u], [2, 5, u], [3, 6, u], [u, 7, u], [u, 8, u]])
    expect(Array.from(itt.parallel([], [1], [2]))).toEqual([[u, 1, 2]])
  })
  it('returns an empty iterator when given no iterators', () => {
    expect(Array.from(itt.parallel())).toEqual([])
  })
  it('returns an empty iterator when given all empty iterators', () => {
    expect(Array.from(itt.parallel([], [], []))).toEqual([])
    expect(Array.from(itt.parallel([]))).toEqual([])
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3]).parallel([4, 5, 6]))).toEqual([[1, 4], [2, 5], [3, 6]])
  })
})

describe('every', () => {
  it('returns true for an empty iterator', () => {
    expect(itt.every(fail, [])).toBe(true)
    expect(itt.every(fail, I())).toBe(true)
  })
  it('returns true if every element satisfies fn', () => {
    expect(itt.every(x => x % 2, [3, 5, 7])).toBe(true)
  })
  it('works as a method', () => {
    expect(itt([3, 5, 7]).every(x => x % 2)).toBe(true)
  })
  it('returns false if any element does not satisfy fn', () => {
    expect(itt.every(x => x % 2, [1, 2, 3, 4, 5])).toBe(false)
    expect(itt.every(x => x > 10, [1])).toBe(false)
  })
  it(`short-circuits when an element does not satisfy fn`, () => {
    let it = false
    const i = itt.every(x => false, function*() {yield 1; it = true; yield 2}())
    expect(it).toBe(false)
  })
})

describe('some', () => {
  it('returns false for an empty iterator', () => {
    expect(itt.some(fail, [])).toBe(false)
    expect(itt.some(fail, I())).toBe(false)
  })
  it('returns true if any element satisfies fn', () => {
    expect(itt.some(x => x > 1, [3, 5, 7])).toBe(true)
    expect(itt.some(x => x % 2, [1, 2, 3, 4, 5])).toBe(true)
  })
  it('works as a method', () => {
    expect(itt([3, 5, 7]).some(x => x > 1)).toBe(true)
  })
  it('returns false if no element satisfies fn', () => {
    expect(itt.some(x => x > 10, [1, 2, 3, 4, 5])).toBe(false)
  })
  it(`short-circuits when an element satisfies fn`, () => {
    let it = false
    const i = itt.some(x => true, function*() {yield 1; it = true; yield 2}())
    expect(it).toBe(false)
  })
})

describe('detect', () => {
  const people = [
    {name: 'Olivia'},
    {name: 'Emily', favoriteBook: 'The Grapes of Wrath'},
    {name: 'Jessica', favoriteBook: 'The Sun Also Rises'},
  ]
  it('returns a truthy result of fn', () => {
    expect(itt.detect(x => x, [0, null, false, undefined, '', 123, 0, null])).toBe(123)
    expect(itt.detect(x => x.id, [{}, {id: 0}, {id: 'f0a'}, {id: ''}, {}])).toBe('f0a')
  })
  it('returns the first truthy result of fn', () => {
    expect(itt.detect(x => x, [0, null, false, undefined, '', 123, 456])).toBe(123)
    expect(itt.detect(x => x.id, [{}, {id: 0}, {id: 'f0a'}, {id: 'f0b'}, {}])).toBe('f0a')
    expect(itt(['bananas', 'oranges', 'blueberries', 'pears', 'apples'])
      .detect(x => x.match(/(\w)\1/g))).toEqual(['rr'])
    expect(itt(people).detect(x => x.favoriteBook))
      .toEqual('The Grapes of Wrath')
  })
  it('works as a method', () => {
    expect(itt([0, 1, null, false]).detect(x => x)).toBe(1)
  })
  it('returns undefined if no element satisfies fn', () => {
    expect(itt.detect(x => x > 100, [1, 2, 3])).toBe(undefined)
    expect(itt(people).detect(x => x.vehicle)).toEqual(undefined)
  })
  it('returns undefined for an empty iterator', () => {
    expect(itt.detect(fail, [])).toBe(undefined)
    expect(itt.detect(fail, I())).toBe(undefined)
  })
  it(`short-circuits when an element satisfies fn`, () => {
    let it = false
    const i = itt.detect(x => x, function*() {yield 1; it = true; yield 2}())
    expect(it).toBe(false)
  })
})

describe('find', () => {
  it('returns an element that satisfies fn', () => {
    expect(itt.find(x => x === 3, [1, 2, 3, 4])).toBe(3)
    expect(itt.find(x => x === 1, [1, 2, 3, 4, 5])).toBe(1)
    expect(itt.find(x => x > 3, [1, 2, 3, 4])).toBe(4)
  })
  it('returns the first element that satisfies fn', () => {
    expect(itt.find(x => x > 0, [1, 2, 3])).toBe(1)
    expect(itt.find(x => x > 2, [1, 2, 3, 4, 5])).toBe(3)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3]).find(x => x > 0)).toBe(1)
  })
  it('returns undefined if no element satisfies fn', () => {
    expect(itt.find(x => x === 10, [1, 2, 3])).toBe(undefined)
  })
  it('returns undefined for an empty iterator', () => {
    expect(itt.find(fail, [])).toBe(undefined)
    expect(itt.find(fail, I())).toBe(undefined)
  })
  it(`short-circuits when an element satisfies fn`, () => {
    let it = false
    const i = itt.find(x => true, function*() {yield 1; it = true; yield 2}())
    expect(it).toBe(false)
  })
  it('defaults to the identity function', () => {
    expect(itt.find([])).toBe(undefined)
    expect(itt.find(I())).toBe(undefined)
    expect(itt.find([1])).toBe(1)
    expect(itt.find(I(1))).toBe(1)
    expect(itt.find([0, false, null, undefined, '', NaN])).toBe(undefined)
    expect(itt.find([0, false, null, undefined, '', 123, NaN])).toBe(123)
    expect(itt.find([0, false, null, undefined, '', 123, 456, NaN])).toBe(123)
    expect(itt.find(I(0, false, null, undefined, '', NaN))).toBe(undefined)
    expect(itt.find(I(0, false, null, undefined, '', 123, NaN))).toBe(123)
    expect(itt.find(I(0, false, null, undefined, '', 123, 456, NaN))).toBe(123)
    expect(itt.find(undefined, [])).toBe(undefined)
    expect(itt.find(undefined, I())).toBe(undefined)
    expect(itt.find(undefined, [1])).toBe(1)
    expect(itt.find(undefined, I(1))).toBe(1)
    expect(itt.find(undefined, [0, false, null, undefined, '', NaN])).toBe(undefined)
    expect(itt.find(undefined, [0, false, null, undefined, '', 123, NaN])).toBe(123)
    expect(itt.find(undefined, [0, false, null, undefined, '', 123, 456, NaN])).toBe(123)
    expect(itt.find(undefined, I(0, false, null, undefined, '', NaN))).toBe(undefined)
    expect(itt.find(undefined, I(0, false, null, undefined, '', 123, NaN))).toBe(123)
    expect(itt.find(undefined, I(0, false, null, undefined, '', 123, 456, NaN))).toBe(123)
  })
})

describe('findLast', () => {
  it('returns an element that satisfies fn', () => {
    expect(itt.findLast(x => x === 3, [1, 2, 3, 4])).toBe(3)
    expect(itt.findLast(x => x === 1, [1, 2, 3, 4, 5])).toBe(1)
    expect(itt.findLast(x => x > 3, [1, 2, 3, 4])).toBe(4)
  })
  it('returns the last element that satisfies fn', () => {
    expect(itt.findLast(x => x > 0, [1, 2, 3])).toBe(3)
    expect(itt.findLast(x => x > 2, [5, 4, 3, 2, 1])).toBe(3)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3]).findLast(x => x > 0)).toBe(3)
  })
  it('returns undefined if no element satisfies fn', () => {
    expect(itt.findLast(x => x === 10, [1, 2, 3])).toBe(undefined)
  })
  it('returns undefined for an empty iterator', () => {
    expect(itt.findLast(fail, [])).toBe(undefined)
    expect(itt.findLast(fail, I())).toBe(undefined)
  })
  it('defaults to the identity function', () => {
    expect(itt.findLast([])).toBe(undefined)
    expect(itt.findLast(I())).toBe(undefined)
    expect(itt.findLast([1])).toBe(1)
    expect(itt.findLast(I(1))).toBe(1)
    expect(itt.findLast([0, false, null, undefined, '', NaN])).toBe(undefined)
    expect(itt.findLast([0, 123, false, null, undefined, '', NaN])).toBe(123)
    expect(itt.findLast([0, 123, false, null, undefined, '', 456, NaN])).toBe(456)
    expect(itt.findLast(I(0, false, null, undefined, '', NaN))).toBe(undefined)
    expect(itt.findLast(I(0, 123, false, null, undefined, '', NaN))).toBe(123)
    expect(itt.findLast(I(0, 123, false, null, undefined, '', 456, NaN))).toBe(456)
    expect(itt.findLast(undefined, [])).toBe(undefined)
    expect(itt.findLast(undefined, I())).toBe(undefined)
    expect(itt.findLast(undefined, [1])).toBe(1)
    expect(itt.findLast(undefined, I(1))).toBe(1)
    expect(itt.findLast(undefined, [0, false, null, undefined, '', NaN])).toBe(undefined)
    expect(itt.findLast(undefined, [0, 123, false, null, undefined, '', NaN])).toBe(123)
    expect(itt.findLast(undefined, [0, 123, false, null, undefined, '', 456, NaN])).toBe(456)
    expect(itt.findLast(undefined, I(0, false, null, undefined, '', NaN))).toBe(undefined)
    expect(itt.findLast(undefined, I(0, 123, false, null, undefined, '', NaN))).toBe(123)
    expect(itt.findLast(undefined, I(0, 123, false, null, undefined, '', 456, NaN))).toBe(456)
  })
})

describe('findIndex', () => {
  it('returns the index of an element that satisfies fn', () => {
    expect(itt.findIndex(x => x === 'c', ['a', 'b', 'c', 'd'])).toBe(2)
    expect(itt.findIndex(x => x === 'a', ['a', 'b', 'c', 'd', 'e'])).toBe(0)
  })
  it('returns the index of the first element that satisfies fn', () => {
    expect(itt.findIndex(x => x > 0, [1, 2, 3])).toBe(0)
    expect(itt.findIndex(x => x > 2, [1, 2, 3, 4, 5])).toBe(2)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3]).findIndex(x => x > 0)).toBe(0)
  })
  it('returns -1 if no element satisfies fn', () => {
    expect(itt.findIndex(x => x === 10, [1, 2, 3])).toBe(-1)
  })
  it('returns -1 for an empty iterator', () => {
    expect(itt.findIndex(fail, [])).toBe(-1)
    expect(itt.findIndex(fail, I())).toBe(-1)
  })
  it(`short-circuits when an element satisfies fn`, () => {
    let it = false
    const i = itt.findIndex(x => true, function*() {yield 1; it = true; yield 2}())
    expect(it).toBe(false)
  })
  it('defaults to the identity function', () => {
    expect(itt.findIndex([])).toBe(-1)
    expect(itt.findIndex(I())).toBe(-1)
    expect(itt.findIndex([1])).toBe(0)
    expect(itt.findIndex(I(1))).toBe(0)
    expect(itt.findIndex([0, false, null, undefined, '', NaN])).toBe(-1)
    expect(itt.findIndex([0, false, null, undefined, '', 123, NaN])).toBe(5)
    expect(itt.findIndex([0, false, null, undefined, '', 123, 456, NaN])).toBe(5)
    expect(itt.findIndex(I(0, false, null, undefined, '', NaN))).toBe(-1)
    expect(itt.findIndex(I(0, false, null, undefined, '', 123, NaN))).toBe(5)
    expect(itt.findIndex(I(0, false, null, undefined, '', 123, 456, NaN))).toBe(5)
    expect(itt.findIndex(undefined, [])).toBe(-1)
    expect(itt.findIndex(undefined, I())).toBe(-1)
    expect(itt.findIndex(undefined, [1])).toBe(0)
    expect(itt.findIndex(undefined, I(1))).toBe(0)
    expect(itt.findIndex(undefined, [0, false, null, undefined, '', NaN])).toBe(-1)
    expect(itt.findIndex(undefined, [0, false, null, undefined, '', 123, NaN])).toBe(5)
    expect(itt.findIndex(undefined, [0, false, null, undefined, '', 123, 456, NaN])).toBe(5)
    expect(itt.findIndex(undefined, I(0, false, null, undefined, '', NaN))).toBe(-1)
    expect(itt.findIndex(undefined, I(0, false, null, undefined, '', 123, NaN))).toBe(5)
    expect(itt.findIndex(undefined, I(0, false, null, undefined, '', 123, 456, NaN))).toBe(5)
  })
})

describe('findLastIndex', () => {
  it('returns the index of an element that satisfies fn', () => {
    expect(itt.findLastIndex(x => x === 'c', ['a', 'b', 'c', 'd'])).toBe(2)
    expect(itt.findLastIndex(x => x === 'a', ['a', 'b', 'c', 'd', 'e'])).toBe(0)
  })
  it('returns the index of the last element that satisfies fn', () => {
    expect(itt.findLastIndex(x => x > 0, [1, 2, 3])).toBe(2)
    expect(itt.findLastIndex(x => x > 2, [5, 4, 3, 2, 1])).toBe(2)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3]).findLastIndex(x => x > 0)).toBe(2)
  })
  it('returns -1 if no element satisfies fn', () => {
    expect(itt.findLastIndex(x => x === 10, [1, 2, 3])).toBe(-1)
  })
  it('returns -1 for an empty iterator', () => {
    expect(itt.findLastIndex(fail, [])).toBe(-1)
    expect(itt.findLastIndex(fail, I())).toBe(-1)
  })
  it('defaults to the identity function', () => {
    expect(itt.findLastIndex([])).toBe(-1)
    expect(itt.findLastIndex(I())).toBe(-1)
    expect(itt.findLastIndex([1])).toBe(0)
    expect(itt.findLastIndex(I(1))).toBe(0)
    expect(itt.findLastIndex([0, false, null, undefined, '', NaN])).toBe(-1)
    expect(itt.findLastIndex([0, 123, false, null, undefined, '', NaN])).toBe(1)
    expect(itt.findLastIndex([0, 456, false, null, undefined, '', 123, NaN])).toBe(6)
    expect(itt.findLastIndex(I(0, false, null, undefined, '', NaN))).toBe(-1)
    expect(itt.findLastIndex(I(0, 123, false, null, undefined, '', NaN))).toBe(1)
    expect(itt.findLastIndex(I(0, 456, false, null, undefined, '', 123, NaN))).toBe(6)
    expect(itt.findLastIndex(undefined, [])).toBe(-1)
    expect(itt.findLastIndex(undefined, I())).toBe(-1)
    expect(itt.findLastIndex(undefined, [1])).toBe(0)
    expect(itt.findLastIndex(undefined, I(1))).toBe(0)
    expect(itt.findLastIndex(undefined, [0, false, null, undefined, '', NaN])).toBe(-1)
    expect(itt.findLastIndex(undefined, [0, 123, false, null, undefined, '', NaN])).toBe(1)
    expect(itt.findLastIndex(undefined, [0, 456, false, null, undefined, '', 123, NaN])).toBe(6)
    expect(itt.findLastIndex(undefined, I(0, false, null, undefined, '', NaN))).toBe(-1)
    expect(itt.findLastIndex(undefined, I(0, 123, false, null, undefined, '', NaN))).toBe(1)
    expect(itt.findLastIndex(undefined, I(0, 456, false, null, undefined, '', 123, NaN))).toBe(6)
  })
})

describe('indexOf', () => {
  it('returns the index of an element identical to x', () => {
    expect(itt.indexOf('a', ['d', 'b', 'a', 'c', 'e'])).toBe(2)
    expect(itt.indexOf('d', ['d', 'b', 'a'])).toBe(0)
  })
  it('returns the index of the first element identical to x', () => {
    expect(itt.indexOf('a', ['a', 'a', 'a', 'a'])).toBe(0)
    expect(itt.indexOf('c', ['a', 'b', 'c', 'c'])).toBe(2)
  })
  it('works as a method', () => {
    expect(itt(['a', 'a', 'a', 'a']).indexOf('a')).toBe(0)
  })
  it('returns -1 if no element is identical to x', () => {
    expect(itt.indexOf('a', ['d', 'b', 'f', 'c', 'e'])).toBe(-1)
    expect(itt.indexOf('z', ['d', 'b', 'a'])).toBe(-1)
  })
  it('returns -1 for an empty iterator', () => {
    expect(itt.indexOf('a', [])).toBe(-1)
    expect(itt.indexOf('z', I())).toBe(-1)
  })
  it('uses === for equality', () => {
    expect(itt.indexOf('1', [1, 2, 3])).toBe(-1)
    expect(itt.indexOf(-0, [1, 1, 0])).toBe(2)
    expect(itt.indexOf(NaN, [NaN, NaN, NaN])).toBe(-1)
  })
  it(`short-circuits when an element is identical to x`, () => {
    let it = false
    const i = itt.indexOf(1, function*() {yield 1; it = true; yield 2}())
    expect(it).toBe(false)
  })
})

describe('lastIndexOf', () => {
  it('returns the index of an element identical to x', () => {
    expect(itt.lastIndexOf('a', ['d', 'b', 'a', 'c', 'e'])).toBe(2)
    expect(itt.lastIndexOf('d', ['d', 'b', 'a'])).toBe(0)
  })
  it('returns the index of the last element identical to x', () => {
    expect(itt.lastIndexOf('a', ['a', 'a', 'a', 'a'])).toBe(3)
    expect(itt.lastIndexOf('c', ['a', 'b', 'c', 'c', 'e'])).toBe(3)
  })
  it('works as a method', () => {
    expect(itt(['a', 'a', 'a', 'a']).lastIndexOf('a')).toBe(3)
  })
  it('returns -1 if no element is identical to x', () => {
    expect(itt.lastIndexOf('a', ['d', 'b', 'f', 'c', 'e'])).toBe(-1)
    expect(itt.lastIndexOf('z', ['d', 'b', 'a'])).toBe(-1)
  })
  it('returns -1 for an empty iterator', () => {
    expect(itt.lastIndexOf('a', [])).toBe(-1)
    expect(itt.lastIndexOf('z', I())).toBe(-1)
  })
  it('uses === for equality', () => {
    expect(itt.lastIndexOf('1', [1, 2, 3])).toBe(-1)
    expect(itt.lastIndexOf(-0, [1, 1, 0])).toBe(2)
    expect(itt.lastIndexOf(NaN, [NaN, NaN, NaN])).toBe(-1)
  })
})

describe('includes', () => {
  it('returns true if an element is identical to x', () => {
    expect(itt.includes('a', ['d', 'b', 'a', 'c', 'e'])).toBe(true)
    expect(itt.includes('d', ['d', 'b', 'a'])).toBe(true)
    expect(itt.includes('a', ['a', 'a', 'a', 'a'])).toBe(true)
    expect(itt.includes('c', ['a', 'b', 'c', 'c'])).toBe(true)
  })
  it('returns false if no element is identical to x', () => {
    expect(itt.includes('a', ['d', 'b', 'f', 'c', 'e'])).toBe(false)
    expect(itt.includes('z', ['d', 'b', 'a'])).toBe(false)
  })
  it('returns false for an empty iterator', () => {
    expect(itt.includes('a', [])).toBe(false)
    expect(itt.includes('z', I())).toBe(false)
  })
  it('uses === for equality', () => {
    expect(itt.includes('1', [1, 2, 3])).toBe(false)
    expect(itt.includes(-0, [1, 1, 0])).toBe(true)
    expect(itt.includes(NaN, [NaN, NaN, NaN])).toBe(false)
  })
  it('works as a method', () => {
    expect(itt(['d', 'b', 'a']).includes('z')).toBe(false)
  })
  it(`short-circuits when an element is identical to x`, () => {
    let it = false
    const i = itt.includes(1, function*() {yield 1; it = true; yield 2}())
    expect(it).toBe(false)
  })
})

describe('reduce', () => {
  it('returns the initial value when given an empty iterator', () => {
    const o = {}
    expect(itt.reduce(0, () => {}, [])).toBe(0)
    expect(itt.reduce(o, () => {}, I())).toBe(o)
  })
  it('accumulates function results', () => {
    expect(itt.reduce(0, (a, b) => a + b, [5, 4, 3, 2, 1, 0])).toBe(15)
  })
  it('works as a method', () => {
    expect(itt([5, 4, 3, 2, 1, 0]).reduce(0, (a, b) => a + b)).toBe(15)
  })
  it('folds left-to-right', () => {
    expect(itt.reduce(':', (a, b) => a + b, ['a', 'b', 'c', 'd', 'e'])).toBe(':abcde')
  })
})

describe('reduce1', () => {
  it('returns undefined when given an empty iterator', () => {
    const o = {}
    expect(itt.reduce1(fail, [])).toBe(undefined)
    expect(itt.reduce1(fail, I())).toBe(undefined)
  })
  it('returns the first element when given only one element', () => {
    expect(itt.reduce1(fail, [5])).toBe(5)
    expect(itt.reduce1(fail, I(3))).toBe(3)
  })
  it('accumulates function results', () => {
    expect(itt.reduce1((a, b) => a + b, [5, 4, 3, 2, 1, 0])).toBe(15)
    expect(itt.reduce1((a, b) => a + b, I(3, 2, 1, 0))).toBe(6)
  })
  it('works as a method', () => {
    expect(itt([5, 4, 3, 2, 1, 0]).reduce1((a, b) => a + b)).toBe(15)
  })
  it('folds left-to-right', () => {
    expect(itt.reduce1((a, b) => a + b, ['a', 'b', 'c', 'd', 'e'])).toBe('abcde')
  })
})

describe('scan', () => {
  it('returns wrapped iterators', () => {
    expect(itt.scan(0, () => {}, []).toArray).toBeDefined()
    expect(itt([]).scan(0, () => {}).toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.scan(0, () => {}, []))).toEqual([])
    expect(Array.from(itt.scan(0, () => {}, I()))).toEqual([])
  })
  it('accumulates and yields function results', () => {
    expect(Array.from(itt.scan(0, (a, b) => a + b, [5, 4, 3, 2, 1, 0]))).toEqual([5, 9, 12, 14, 15, 15])
  })
  it('folds left-to-right', () => {
    expect(Array.from(itt.scan(':', (a, b) => a + b, ['a', 'b', 'c', 'd']))).toEqual([':a', ':ab', ':abc', ':abcd'])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false
    const i = itt.scan(0, (a, b) => a + b, function*() {it1 = true; yield 1; it2 = true; yield 2; it3 = true; yield 3}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
    i.next()
    expect(it3).toBe(false)
  })
})

describe('scan1', () => {
  it('returns wrapped iterators', () => {
    expect(itt.scan1(() => {}, []).toArray).toBeDefined()
    expect(itt([]).scan1(() => {}).toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.scan1(() => {}, []))).toEqual([])
    expect(Array.from(itt.scan1(() => {}, I()))).toEqual([])
  })
  it('accumulates and yields function results', () => {
    expect(Array.from(itt.scan1((a, b) => a + b, [5, 4, 3, 2, 1, 0]))).toEqual([5, 9, 12, 14, 15, 15])
  })
  it('folds left-to-right', () => {
    expect(Array.from(itt.scan1((a, b) => a + b, ['a', 'b', 'c', 'd']))).toEqual(['a', 'ab', 'abc', 'abcd'])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false
    const i = itt.scan1((a, b) => a + b, function*() {it1 = true; yield 1; it2 = true; yield 2; it3 = true; yield 3}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
    i.next()
    expect(it3).toBe(false)
  })
})

describe('inject', () => {
  it('returns the accumulator when given an empty iterator', () => {
    const o = {}, p = {}
    expect(itt.inject(o, () => {}, [])).toBe(o)
    expect(itt.inject(p, () => {}, I())).toBe(p)
  })
  it(`doesn't apply the update function when given an empty iterator`, () => {
    const f = jasmine.createSpy()
    itt.inject({}, f, [])
    expect(f).not.toHaveBeenCalled()
  })
  it('returns the accumulator', () => {
    const o = {}, p = {}
    expect(itt.inject(o, () => {}, [1])).toBe(o)
    expect(itt.inject(p, () => {}, [1, 2, 3, 4, 5])).toBe(p)
  })
  it('works as a method', () => {
    const o = {}
    expect(itt([1, 2, 3, 4]).inject(o, () => {})).toBe(o)
  })
  it('applies the update function to each iterator element', () => {
    expect(itt.inject([], (els, x) => els.unshift(x), [5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5])
  })
})

describe('forEach', () => {
  it('applies fn to each iterator element', () => {
    const res = []
    itt.forEach(x => res.unshift(x), I(1, 2, 3, 4))
    expect(res).toEqual([4, 3, 2, 1])
  })
  it('works as a method', () => {
    const res = []
    itt([1, 2, 3, 4]).forEach(x => res.unshift(x))
    expect(res).toEqual([4, 3, 2, 1])
  })
  it(`doesn't apply fn when given an empty iterator`, () => {
    const f = jasmine.createSpy(), g = jasmine.createSpy()
    itt.forEach(f, [])
    itt.forEach(g, [])
    expect(f).not.toHaveBeenCalled()
    expect(g).not.toHaveBeenCalled()
  })
  it('returns undefined', () => {
    expect(itt.forEach(() => 1, [])).toBe(undefined)
    expect(itt.forEach(() => 1, [1, 2, 3, 4, 5])).toBe(undefined)
    expect(itt.forEach(() => 1, I())).toBe(undefined)
  })
})

describe('drain', () => {
  it('consumes all iterator elements', () => {
    let it1 = false, it2 = false, it3 = false
    itt.drain(function*() {it1 = true; yield 1; it2 = true; yield 2; it3 = true}())
    expect(it1).toBe(true)
    expect(it2).toBe(true)
    expect(it3).toBe(true)
  })
  it('returns undefined', () => {
    expect(itt.drain([])).toBe(undefined)
    expect(itt.drain([1, 2, 3, 4, 5])).toBe(undefined)
    expect(itt.drain(I())).toBe(undefined)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3, 4, 5]).drain()).toBe(undefined)
  })
})

describe('first', () => {
  it('returns the first iterator element', () => {
    expect(itt.first([5, 2, 3])).toBe(5)
    expect(itt.first(I('c', 'b', 'a'))).toBe('c')
  })
  it('returns undefined for empty iterators', () => {
    expect(itt.first([])).toBe(undefined)
    expect(itt.first(I())).toBe(undefined)
  })
  it('works as a method', () => {
    expect(itt([5, 2, 3]).first()).toBe(5)
  })
  it('is aliased to head', () => {
    expect(itt([5, 2, 3]).head()).toBe(5)
    expect(itt.head([5, 2, 3])).toBe(5)
  })
})

describe('last', () => {
  it('returns the last iterator element', () => {
    expect(itt.last([5, 2, 3])).toBe(3)
    expect(itt.last(I('c', 'b', 'a'))).toBe('a')
  })
  it('returns undefined for empty iterators', () => {
    expect(itt.last([])).toBe(undefined)
    expect(itt.last(I())).toBe(undefined)
  })
  it('works as a method', () => {
    expect(itt([5, 2, 3]).last()).toBe(3)
  })
})

describe('tail', () => {
  it('returns wrapped iterators', () => {
    expect(itt.tail([]).toArray).toBeDefined()
    expect(itt([]).tail().toArray).toBeDefined()
  })
  it('yields all but the first iterator element', () => {
    expect(Array.from(itt.tail([5, 2, 3]))).toEqual([2, 3])
    expect(Array.from(itt.tail(I('c', 'b', 'a')))).toEqual(['b', 'a'])
  })
  it('returns an empty iterator when given a singleton iterator', () => {
    expect(Array.from(itt.tail([1]))).toEqual([])
    expect(Array.from(itt.tail(I('c')))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.tail([]))).toEqual([])
    expect(Array.from(itt.tail(I()))).toEqual([])
  })
  it('works as a method', () => {
    expect(Array.from(itt([5, 2, 3]).tail())).toEqual([2, 3])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.tail(function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('init', () => {
  it('returns wrapped iterators', () => {
    expect(itt.init([]).toArray).toBeDefined()
    expect(itt([]).init().toArray).toBeDefined()
  })
  it('yields all but the last iterator element', () => {
    expect(Array.from(itt.init([5, 2, 3]))).toEqual([5, 2])
    expect(Array.from(itt.init(I('c', 'b', 'a')))).toEqual(['c', 'b'])
  })
  it('returns an empty iterator when given a singleton iterator', () => {
    expect(Array.from(itt.init([1]))).toEqual([])
    expect(Array.from(itt.init(I('c')))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.init([]))).toEqual([])
    expect(Array.from(itt.init(I()))).toEqual([])
  })
  it('works as a method', () => {
    expect(Array.from(itt([5, 2, 3]).init())).toEqual([5, 2])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false
    const i = itt.init(function*() {it1 = true; yield 1; yield 2; it2 = true; yield 3}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
  })
})

describe('count', () => {
  it('returns the number of iterator elements', () => {
    expect(itt.count([5, 4, 3, 2])).toEqual(4)
    expect(itt.count(I(1, 3, 5))).toEqual(3)
  })
  it('returns 0 for empty iterators', () => {
    expect(itt.count([])).toEqual(0)
    expect(itt.count(I())).toEqual(0)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3]).count()).toEqual(3)
  })
})

describe('pick', () => {
  it('returns the ith iterator element', () => {
    expect(itt.pick(0, [1, 2, 3, 4])).toBe(1)
    expect(itt.pick(2, ['a', 'b', 'c', 'd'])).toBe('c')
    expect(itt.pick(3, [1, 2, 3, 4])).toBe(4)
    expect(itt.pick(0, I('a', 'b', 'c', 'd'))).toBe('a')
    expect(itt.pick(2, I('a', 'b', 'c', 'd'))).toBe('c')
    expect(itt.pick(3, I('a', 'b', 'c', 'd'))).toBe('d')
  })
  it('returns undefined for i < 0', () => {
    expect(itt.pick(-1, [1, 2, 3])).toBe(undefined)
    expect(itt.pick(-1, I(1, 2, 3))).toBe(undefined)
  })
  it('returns undefined if i >= the number of elements', () => {
    expect(itt.pick(3, [1, 2, 3])).toBe(undefined)
    expect(itt.pick(10, [1, 2, 3, 4])).toBe(undefined)
    expect(itt.pick(3, I(1, 2, 3))).toBe(undefined)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3]).pick(0)).toBe(1)
  })
})

describe('sum', () => {
  it('returns the sum of the iterator elements', () => {
    expect(itt.sum([1, 2, 3, 4])).toBe(10)
  })
  it('converts iterator elements to numbers', () => {
    expect(itt.sum(['1', {valueOf: () => 2}, '3', 4])).toBe(10)
  })
  it('returns the iterator element for singleton iterators', () => {
    expect(itt.sum([5])).toBe(5)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3]).sum()).toBe(6)
  })
  it('returns 0 for an empty iterator', () => {
    expect(itt.sum([])).toBe(0)
    expect(itt(I()).sum()).toBe(0)
  })
})

describe('mean', () => {
  it('returns the arithmetic mean of the iterator elements', () => {
    expect(itt.mean([1, 2, 3, 4])).toBe(2.5)
  })
  it('converts iterator elements to numbers', () => {
    expect(itt.mean(['1', {valueOf: () => 2}, '3', 4])).toBe(2.5)
  })
  it('returns the iterator element for singleton iterators', () => {
    expect(itt.mean([3])).toBe(3)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3]).mean()).toBe(2)
  })
  it('returns NaN for an empty iterator', () => {
    expect(itt.mean([])).toBeNaN()
    expect(itt(I()).mean()).toBeNaN()
  })
})

describe('product', () => {
  it('returns the product of the iterator elements', () => {
    expect(itt.product([1, 2, 3, 4])).toBe(24)
  })
  it('converts iterator elements to numbers', () => {
    expect(itt.product(['1', {valueOf: () => 2}, '3', 4])).toBe(24)
  })
  it('returns the iterator element for singleton iterators', () => {
    expect(itt.product([5])).toBe(5)
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3]).product()).toBe(6)
  })
  it('returns 1 for an empty iterator', () => {
    expect(itt.product([])).toBe(1)
    expect(itt(I()).product()).toBe(1)
  })
})

describe('max', () => {
  it('returns the greatest of the iterator elements', () => {
    expect(itt.max([6, -1, 5, 2])).toBe(6)
    expect(itt.max([1, -1, 5, 2])).toBe(5)
    expect(itt.max([1, -1, 5, 7])).toBe(7)
  })
  it('converts iterator elements to numbers', () => {
    expect(itt.max(['6', {valueOf: () => -1}, '5', 2])).toBe(6)
  })
  it('returns the iterator element for singleton iterators', () => {
    expect(itt.max([5])).toBe(5)
  })
  it('works as a method', () => {
    expect(itt([5, -1, 3, 4]).max()).toBe(5)
  })
  it('returns -inf for an empty iterator', () => {
    expect(itt.max([])).toBe(-Infinity)
    expect(itt(I()).max()).toBe(-Infinity)
  })
})

describe('min', () => {
  it('returns the least of the iterator elements', () => {
    expect(itt.min([-1, 6, 5, 2])).toBe(-1)
    expect(itt.min([1, -1, 5, -6])).toBe(-6)
    expect(itt.min([10, 9, 5, 7])).toBe(5)
  })
  it('converts iterator elements to numbers', () => {
    expect(itt.min(['6', {valueOf: () => -1}, '5', 2])).toBe(-1)
  })
  it('returns the iterator element for singleton iterators', () => {
    expect(itt.min([5])).toBe(5)
  })
  it('works as a method', () => {
    expect(itt([5, -1, 3, 4]).min()).toBe(-1)
  })
  it('returns inf for an empty iterator', () => {
    expect(itt.min([])).toBe(Infinity)
    expect(itt(I()).min()).toBe(Infinity)
  })
})

describe('minMax', () => {
  it('returns the least and greatest of the iterator elements', () => {
    expect(itt.minMax([-1, 6, 5, 2])).toEqual([-1, 6])
    expect(itt.minMax([1, -1, 5, -6])).toEqual([-6, 5])
    expect(itt.minMax([10, 9, 5, 7])).toEqual([5, 10])
  })
  it('converts iterator elements to numbers', () => {
    expect(itt.minMax(['6', {valueOf: () => -1}, '5', 2])).toEqual([-1, 6])
  })
  it('returns the iterator element for singleton iterators', () => {
    expect(itt.minMax([5])).toEqual([5, 5])
  })
  it('works as a method', () => {
    expect(itt([5, -1, 3, 4]).minMax()).toEqual([-1, 5])
  })
  it('returns [inf, -inf] for an empty iterator', () => {
    expect(itt.minMax([])).toEqual([Infinity, -Infinity])
    expect(itt(I()).minMax()).toEqual([Infinity, -Infinity])
  })
})

describe('groupBy', () => {
  it('returns an empty map when given an empty iterator', () => {
    expect(itt.groupBy(x => 1, false, []).size).toBe(0)
    expect(itt.groupBy(x => 1, false, I()).size).toBe(0)
    expect(itt.groupBy(x => 1, true, []).size).toBe(0)
    expect(itt.groupBy(x => 1, true, I()).size).toBe(0)
  })
  it('returns maps', () => {
    expect(itt.groupBy(x => 1, true, ['a', 'b', 'c'])).toEqual(jasmine.any(Map))
    expect(itt.groupBy(x => 1, false, ['a', 'b', 'c'])).toEqual(jasmine.any(Map))
  })
  it('defaults to non-unique', () => {
    expect(Array.from(itt.groupBy(x => 1, ['a', 'b', 'c']))).toEqual([[1, ['a', 'b', 'c']]])
    expect(Array.from(itt(['a', 'b', 'c']).groupBy(x => 1))).toEqual([[1, ['a', 'b', 'c']]])
  })
  it('groups items in the map by fn', () => {
    expect(Array.from(itt.groupBy(x => x.length, ['a', 'bc', 'd', 'e', 'fg', 'hi', 'j']))
      .sort((a, b) => (a[0] - b[0])))
    .toEqual([[1, ['a', 'd', 'e', 'j']], [2, ['bc', 'fg', 'hi']]])
  })
  it('returns arrays when unique = false', () => {
    expect(Array.from(itt.groupBy(x => 1, ['a']))).toEqual([[1, ['a']]])
  })
  it('keeps duplicate items when unique = false', () => {
    expect(Array.from(itt.groupBy(x => x.length, ['a', 'bb', 'a', 'a', 'bb', 'bb', 'a']))
      .sort((a, b) => (a[0] - b[0])))
    .toEqual([[1, ['a', 'a', 'a', 'a']], [2, ['bb', 'bb', 'bb']]])
  })
  it('returns sets when unique = true', () => {
    expect(Array.from(itt.groupBy(x => 1, true, ['a']))[0][1]).toEqual(jasmine.any(Set))
  })
  it('removes duplicate items when unique = true', () => {
    expect(Array.from(itt.groupBy(x => x.length, true, ['a', 'cc', 'a', 'b', 'bb', 'bb', 'a']))
      .sort((a, b) => (a[0] - b[0]))
      .map(a => [a[0], Array.from(a[1]).sort()]))
    .toEqual([[1, ['a', 'b']], [2, ['bb', 'cc']]])
  })
  it('works as a method', () => {
    expect(Array.from(itt(['a']).groupBy(x => 1))).toEqual([[1, ['a']]])
  })
})

describe('keyBy', () => {
  it('returns a map', () => {
    expect(itt.keyBy(a => 1, ['a'])).toEqual(jasmine.any(Map))
  })
  it('maps return values to elements', () => {
    expect(Array.from(itt.keyBy(a => a.length, ['bye', 'hello'])).sort((a, b) => a[0] - b[0])).toEqual([[3, 'bye'], [5, 'hello']])
  })
  it('later elements overwrite earlier elements', () => {
    expect(Array.from(itt.keyBy(a => a.length, ['bye', 'hello', 'cat', 'dog', 'world'])).sort((a, b) => a[0] - b[0])).toEqual([[3, 'dog'], [5, 'world']])
  })
  it('works as a method', () => {
    expect(Array.from(itt(['bye']).keyBy(a => a.length))).toEqual([[3, 'bye']])
  })
})

describe('unique', () => {
  it('returns wrapped iterators', () => {
    expect(itt.unique([1, 2, 3, 1, 3, 5]).toArray).toBeDefined()
    expect(itt([1, 2, 3, 1, 3, 5]).unique().toArray).toBeDefined()
  })
  it('yields each unique iterator element', () => {
    expect(Array.from(itt.unique([1, 3, 5, 7, 9]))).toEqual([1, 3, 5, 7, 9])
  })
  it('only yields the first unique element', () => {
    expect(Array.from(itt.unique([1, 3, 5, 1, 4, 5, 1, 3, 6]))).toEqual([1, 3, 5, 4, 6])
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 3, 5, 7, 9]).unique())).toEqual([1, 3, 5, 7, 9])
  })
  it(`doesn't consume elements until they must be yielded`, () => {
    let it1 = false, it2 = false, it3 = false
    const i = itt.unique(function*() {it1 = true; yield 1; it2 = true; yield 1; yield 2; it3 = true; yield 3}())
    expect(it1).toBe(false)
    i.next()
    expect(it2).toBe(false)
    i.next()
    expect(it3).toBe(false)
  })
})

describe('toArray', () => {
  it('returns [] when given an empty iterator', () => {
    expect(itt.toArray([])).toEqual([])
    expect(itt.toArray(I())).toEqual([])
  })
  it('returns an array of the iterator elements', () => {
    expect(itt.toArray(I(1, 2, 3, 2, 1))).toEqual([1, 2, 3, 2, 1])
    expect(itt.toArray(I('a'))).toEqual(['a'])
    expect(itt.toArray([1])).toEqual([1])
  })
  it('works as a method', () => {
    expect(itt(I(1, 2, 3)).toArray()).toEqual([1, 2, 3])
  })
})

describe('toMap', () => {
  it('returns an empty map when given an empty iterator', () => {
    expect(itt.toMap([]).size).toBe(0)
    expect(itt.toMap(I()).size).toBe(0)
  })
  it('returns maps', () => {
    expect(itt.toMap([[1, 'foo'], [2, 'bar']])).toEqual(jasmine.any(Map))
  })
  it('returns a map constructed from the iterator pairs', () => {
    const m = itt.toMap([[1, 'foo'], ['a', 6]])
    expect(m.size).toBe(2)
    expect(m.get(1)).toBe('foo')
    expect(m.get('a')).toBe(6)
    const n = itt.toMap(I([1, 'foo'], ['a', 6]))
    expect(n.size).toBe(2)
    expect(n.get(1)).toBe('foo')
    expect(n.get('a')).toBe(6)
  })
  it('works as a method', () => {
    expect(itt([[1, 'foo'], [2, 'bar']]).toMap()).toEqual(jasmine.any(Map))
  })
})

describe('toSet', () => {
  it('returns an empty set when given an empty iterator', () => {
    expect(itt.toSet([]).size).toBe(0)
    expect(itt.toSet(I()).size).toBe(0)
  })
  it('returns sets', () => {
    expect(itt.toSet([1, 'foo', 2, 'bar'])).toEqual(jasmine.any(Set))
  })
  it('returns a set of the iterator pairs', () => {
    expect(Array.from(itt.toSet(I(1, 5, 'abc', 3, 1, 7))).sort()).toEqual([1, 3, 5, 7, 'abc'])
  })
  it('works as a method', () => {
    expect(itt([1, 'foo', 2, 'bar']).toSet()).toEqual(jasmine.any(Set))
  })
})

describe('toObject', () => {
  it('returns an empty object when given an empty iterator', () => {
    expect(itt.toObject([])).toEqual({})
    expect(itt.toObject(I())).toEqual({})
    expect(itt.toObject(true, [])).toEqual({})
    expect(itt.toObject(true, I())).toEqual({})
  })
  it('defaults to Object instances', () => {
    expect(Object.getPrototypeOf(itt.toObject([]))).toBe(Object.prototype)
    expect(Object.getPrototypeOf(itt([]).toObject())).toBe(Object.prototype)
  })
  it('returns objects', () => {
    expect(itt.toObject(false, [[1, 'foo'], [2, 'bar']])).toEqual(jasmine.any(Object))
    expect(itt.toObject(true, [[1, 'foo'], [2, 'bar']])).toEqual(jasmine.any(Object))
  })
  it('returns Object instances when empty = false', () => {
    expect(Object.getPrototypeOf(itt.toObject(false, []))).toBe(Object.prototype)
    expect(Object.getPrototypeOf(itt([]).toObject(false))).toBe(Object.prototype)
  })
  it('returns empty objects when empty = true', () => {
    expect(Object.getPrototypeOf(itt.toObject(true, []))).toBe(null)
    expect(Object.getPrototypeOf(itt([]).toObject(true))).toBe(null)
  })
  it('returns an object constructed from the iterator pairs', () => {
    expect(itt.toObject([[1, 'foo'], ['a', 6]])).toEqual({1: 'foo', a: 6})
    expect(itt.toObject(I([1, 'foo'], ['a', 6]))).toEqual({1: 'foo', a: 6})
    expect(itt.toObject(true, [[1, 'foo'], ['a', 6]])).toEqual({1: 'foo', a: 6})
  })
  it('works as a method', () => {
    expect(itt([[1, 'foo'], [2, 'bar']]).toObject()).toEqual({1: 'foo', 2: 'bar'})
    expect(itt([[1, 'foo'], [2, 'bar']]).toObject(true)).toEqual({1: 'foo', 2: 'bar'})
  })
})

describe('intersperse', () => {
  it('returns wrapped iterators', () => {
    expect(itt.intersperse([]).toArray).toBeDefined()
    expect(itt([]).intersperse().toArray).toBeDefined()
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.intersperse(0, []))).toEqual([])
    expect(Array.from(itt.intersperse(0, I()))).toEqual([])
  })
  it('returns a singleton iterator when given a singleton iterator', () => {
    expect(Array.from(itt.intersperse(0, [1]))).toEqual([1])
    expect(Array.from(itt.intersperse(0, I('a')))).toEqual(['a'])
  })
  it('yields sep between each pair of iterator elements', () => {
    expect(Array.from(itt.intersperse(0, [1, 2, 3]))).toEqual([1, 0, 2, 0, 3])
    expect(Array.from(itt.intersperse('!', I('a', 'b', 'c', 'd')))).toEqual(['a', '!', 'b', '!', 'c', '!', 'd'])
  })
  it('works as a method', () => {
    expect(Array.from(itt([1, 2, 3]).intersperse(0))).toEqual([1, 0, 2, 0, 3])
  })
})

describe('join', () => {
  it('returns an empty string for an empty iterator', () => {
    expect(itt.join(':', [])).toEqual('')
    expect(itt.join(':', I())).toEqual('')
  })
  it('stringifies the element for singleton iterators', () => {
    expect(itt.join(':', [100])).toEqual('100')
    expect(itt.join(':', ['asdf'])).toEqual('asdf')
  })
  it('stringifies each iterator element separated by sep', () => {
    expect(itt.join(':', ['abc', 'defg', 'hi'])).toEqual('abc:defg:hi')
    expect(itt.join('+', [1, 2, 3, 4, 5])).toEqual('1+2+3+4+5')
  })
  it('works for multi-character separators', () => {
    expect(itt.join('==>', [1, 2, 3])).toEqual('1==>2==>3')
  })
  it('works for an empty separator', () => {
    expect(itt.join('', [1, 2, 3])).toEqual('123')
  })
  it(`defaults to sep = ','`, () => {
    expect(itt.join(['abc', 'defg', 'hi'])).toEqual('abc,defg,hi')
    expect(itt.join([1, 2, 3, 4, 5])).toEqual('1,2,3,4,5')
    expect(itt(['abc', 'defg', 'hi']).join()).toEqual('abc,defg,hi')
    expect(itt([1, 2, 3, 4, 5]).join()).toEqual('1,2,3,4,5')
  })
  it('works as a method', () => {
    expect(itt([1, 2, 3, 4, 5]).join('+')).toEqual('1+2+3+4+5')
  })
})

describe('slice', () => {
  it('returns wrapped iterators', () => {
    expect(itt.slice([]).toArray).toBeDefined()
    expect(itt([]).slice().toArray).toBeDefined()
  })
  it('yields every iterator element when given no arguments', () => {
    expect(Array.from(itt.slice([]))).toEqual([])
    expect(Array.from(itt.slice([9]))).toEqual([9])
    expect(Array.from(itt.slice([1, 2, 3]))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice([9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(I()))).toEqual([])
    expect(Array.from(itt.slice(I(9)))).toEqual([9])
    expect(Array.from(itt.slice(I(1, 2, 3)))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
  })
  it('yields every iterator element when start = 0 and end is not given', () => {
    expect(Array.from(itt.slice(0, []))).toEqual([])
    expect(Array.from(itt.slice(0, [9]))).toEqual([9])
    expect(Array.from(itt.slice(0, [1, 2, 3]))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(0, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(0, I()))).toEqual([])
    expect(Array.from(itt.slice(0, I(9)))).toEqual([9])
    expect(Array.from(itt.slice(0, I(1, 2, 3)))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(0, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
  })
  it('yields all but the first n elements when given one positive argument', () => {
    expect(Array.from(itt.slice(1, []))).toEqual([])
    expect(Array.from(itt.slice(10, []))).toEqual([])
    expect(Array.from(itt.slice(1, [9]))).toEqual([])
    expect(Array.from(itt.slice(5, [9]))).toEqual([])
    expect(Array.from(itt.slice(1, [1, 2, 3]))).toEqual([2, 3])
    expect(Array.from(itt.slice(2, [1, 2, 3]))).toEqual([3])
    expect(Array.from(itt.slice(3, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(5, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(3, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(6, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([3, 2, 1])
    expect(Array.from(itt.slice(9, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(10, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(1, I()))).toEqual([])
    expect(Array.from(itt.slice(10, I()))).toEqual([])
    expect(Array.from(itt.slice(1, I(9)))).toEqual([])
    expect(Array.from(itt.slice(5, I(9)))).toEqual([])
    expect(Array.from(itt.slice(1, I(1, 2, 3)))).toEqual([2, 3])
    expect(Array.from(itt.slice(2, I(1, 2, 3)))).toEqual([3])
    expect(Array.from(itt.slice(3, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(5, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(3, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(6, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([3, 2, 1])
    expect(Array.from(itt.slice(9, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(10, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
  })
  it('yields the last n elements when given one negative argument', () => {
    expect(Array.from(itt.slice(-1, []))).toEqual([])
    expect(Array.from(itt.slice(-10, []))).toEqual([])
    expect(Array.from(itt.slice(-1, [9]))).toEqual([9])
    expect(Array.from(itt.slice(-5, [9]))).toEqual([9])
    expect(Array.from(itt.slice(-1, [1, 2, 3]))).toEqual([3])
    expect(Array.from(itt.slice(-2, [1, 2, 3]))).toEqual([2, 3])
    expect(Array.from(itt.slice(-3, [1, 2, 3]))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(-5, [1, 2, 3]))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(-1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([1])
    expect(Array.from(itt.slice(-3, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([3, 2, 1])
    expect(Array.from(itt.slice(-6, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(-9, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(-10, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(-1, I()))).toEqual([])
    expect(Array.from(itt.slice(-10, I()))).toEqual([])
    expect(Array.from(itt.slice(-1, I(9)))).toEqual([9])
    expect(Array.from(itt.slice(-5, I(9)))).toEqual([9])
    expect(Array.from(itt.slice(-1, I(1, 2, 3)))).toEqual([3])
    expect(Array.from(itt.slice(-2, I(1, 2, 3)))).toEqual([2, 3])
    expect(Array.from(itt.slice(-3, I(1, 2, 3)))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(-5, I(1, 2, 3)))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(-1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([1])
    expect(Array.from(itt.slice(-3, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([3, 2, 1])
    expect(Array.from(itt.slice(-6, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(-9, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(-10, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
  })
  it('yields a slice when given two nonnegative arguments', () => {
    expect(Array.from(itt.slice(0, 1, [1]))).toEqual([1])
    expect(Array.from(itt.slice(0, 5, [1]))).toEqual([1])
    expect(Array.from(itt.slice(1, 2, [1, 2, 3]))).toEqual([2])
    expect(Array.from(itt.slice(2, 3, [1, 2, 3]))).toEqual([3])
    expect(Array.from(itt.slice(0, 1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9])
    expect(Array.from(itt.slice(4, 6, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([5, 4])
    expect(Array.from(itt.slice(8, 9, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([1])
    expect(Array.from(itt.slice(0, 9, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(0, 3, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7])
    expect(Array.from(itt.slice(0, 100, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(0, 1, I(1)))).toEqual([1])
    expect(Array.from(itt.slice(0, 5, I(1)))).toEqual([1])
    expect(Array.from(itt.slice(1, 2, I(1, 2, 3)))).toEqual([2])
    expect(Array.from(itt.slice(2, 3, I(1, 2, 3)))).toEqual([3])
    expect(Array.from(itt.slice(0, 1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9])
    expect(Array.from(itt.slice(4, 6, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([5, 4])
    expect(Array.from(itt.slice(8, 9, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([1])
    expect(Array.from(itt.slice(0, 9, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(Array.from(itt.slice(0, 3, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7])
    expect(Array.from(itt.slice(0, 100, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
  })
  it('returns an empty iterator when given two nonnegative arguments and len <= start < end', () => {
    expect(Array.from(itt.slice(0, 1, []))).toEqual([])
    expect(Array.from(itt.slice(3, 5, []))).toEqual([])
    expect(Array.from(itt.slice(1, 3, [1]))).toEqual([])
    expect(Array.from(itt.slice(5, 7, [1]))).toEqual([])
    expect(Array.from(itt.slice(3, 7, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(9, 10, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(10, 12, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(100, 200, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(0, 1, I()))).toEqual([])
    expect(Array.from(itt.slice(3, 5, I()))).toEqual([])
    expect(Array.from(itt.slice(1, 3, I(1)))).toEqual([])
    expect(Array.from(itt.slice(5, 7, I(1)))).toEqual([])
    expect(Array.from(itt.slice(3, 7, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(9, 10, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(10, 12, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(100, 200, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
  })
  it('returns an empty iterator when given two nonnegative arguments and start >= end', () => {
    expect(Array.from(itt.slice(5, 3, []))).toEqual([])
    expect(Array.from(itt.slice(3, 3, []))).toEqual([])
    expect(Array.from(itt.slice(1, 0, [1]))).toEqual([])
    expect(Array.from(itt.slice(10, 10, [1]))).toEqual([])
    expect(Array.from(itt.slice(11, 10, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(1, 0, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(5, 0, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(5, 4, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(4, 4, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(5, 3, I()))).toEqual([])
    expect(Array.from(itt.slice(3, 3, I()))).toEqual([])
    expect(Array.from(itt.slice(1, 0, I(1)))).toEqual([])
    expect(Array.from(itt.slice(10, 10, I(1)))).toEqual([])
    expect(Array.from(itt.slice(11, 10, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(1, 0, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(5, 0, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(5, 4, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(4, 4, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
  })
  it('yields a slice when start < 0 && end >= 0', () => {
    expect(Array.from(itt.slice(-1, 0, []))).toEqual([])
    expect(Array.from(itt.slice(-10, 0, []))).toEqual([])
    expect(Array.from(itt.slice(-1, 1, []))).toEqual([])
    expect(Array.from(itt.slice(-10, 10, []))).toEqual([])
    expect(Array.from(itt.slice(-1, 0, [1]))).toEqual([])
    expect(Array.from(itt.slice(-1, 1, [1]))).toEqual([1])
    expect(Array.from(itt.slice(-10, 5, [1]))).toEqual([1])
    expect(Array.from(itt.slice(-1, 2, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(-2, 2, [1, 2, 3]))).toEqual([2])
    expect(Array.from(itt.slice(-1, 3, [1, 2, 3]))).toEqual([3])
    expect(Array.from(itt.slice(-2, 3, [1, 2, 3]))).toEqual([2, 3])
    expect(Array.from(itt.slice(-3, 3, [1, 2, 3]))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(-3, 1, [1, 2, 3]))).toEqual([1])
    expect(Array.from(itt.slice(-5, 2, [1, 2, 3]))).toEqual([1, 2])
    expect(Array.from(itt.slice(-1, 10, [1, 2, 3]))).toEqual([3])
    expect(Array.from(itt.slice(-100, 0, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(-100, 10, [1, 2, 3]))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(-1, 1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-5, 5, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([5])
    expect(Array.from(itt.slice(-8, 8, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([8, 7, 6, 5, 4, 3, 2])
    expect(Array.from(itt.slice(-3, 9, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([3, 2, 1])
    expect(Array.from(itt.slice(-3, 3, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-1, 100, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([1])
    expect(Array.from(itt.slice(-4, 100, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([4, 3, 2, 1])
    expect(Array.from(itt.slice(-1, 0, I()))).toEqual([])
    expect(Array.from(itt.slice(-10, 0, I()))).toEqual([])
    expect(Array.from(itt.slice(-1, 1, I()))).toEqual([])
    expect(Array.from(itt.slice(-10, 10, I()))).toEqual([])
    expect(Array.from(itt.slice(-1, 0, I(1)))).toEqual([])
    expect(Array.from(itt.slice(-1, 1, I(1)))).toEqual([1])
    expect(Array.from(itt.slice(-10, 5, I(1)))).toEqual([1])
    expect(Array.from(itt.slice(-1, 2, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(-2, 2, I(1, 2, 3)))).toEqual([2])
    expect(Array.from(itt.slice(-1, 3, I(1, 2, 3)))).toEqual([3])
    expect(Array.from(itt.slice(-2, 3, I(1, 2, 3)))).toEqual([2, 3])
    expect(Array.from(itt.slice(-3, 3, I(1, 2, 3)))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(-3, 1, I(1, 2, 3)))).toEqual([1])
    expect(Array.from(itt.slice(-5, 2, I(1, 2, 3)))).toEqual([1, 2])
    expect(Array.from(itt.slice(-1, 10, I(1, 2, 3)))).toEqual([3])
    expect(Array.from(itt.slice(-100, 0, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(-100, 10, I(1, 2, 3)))).toEqual([1, 2, 3])
    expect(Array.from(itt.slice(-1, 1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-5, 5, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([5])
    expect(Array.from(itt.slice(-8, 8, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([8, 7, 6, 5, 4, 3, 2])
    expect(Array.from(itt.slice(-3, 9, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([3, 2, 1])
    expect(Array.from(itt.slice(-3, 3, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-1, 100, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([1])
    expect(Array.from(itt.slice(-4, 100, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([4, 3, 2, 1])
  })
  it('yields a slice when start < 0 && end < 0', () => {
    expect(Array.from(itt.slice(-1, -1, []))).toEqual([])
    expect(Array.from(itt.slice(-3, -1, []))).toEqual([])
    expect(Array.from(itt.slice(-5, -2, []))).toEqual([])
    expect(Array.from(itt.slice(-5, -5, []))).toEqual([])
    expect(Array.from(itt.slice(-1, -6, []))).toEqual([])
    expect(Array.from(itt.slice(-1, -1, [1]))).toEqual([])
    expect(Array.from(itt.slice(-2, -1, [1]))).toEqual([])
    expect(Array.from(itt.slice(-1, -10, [1]))).toEqual([])
    expect(Array.from(itt.slice(-1, -1, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(-1, -2, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(-2, -1, [1, 2, 3]))).toEqual([2])
    expect(Array.from(itt.slice(-2, -2, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(-3, -1, [1, 2, 3]))).toEqual([1, 2])
    expect(Array.from(itt.slice(-3, -2, [1, 2, 3]))).toEqual([1])
    expect(Array.from(itt.slice(-4, -1, [1, 2, 3]))).toEqual([1, 2])
    expect(Array.from(itt.slice(-4, -2, [1, 2, 3]))).toEqual([1])
    expect(Array.from(itt.slice(-5, -1, [1, 2, 3]))).toEqual([1, 2])
    expect(Array.from(itt.slice(-5, -3, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(-1, -10, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(-100, -1, [1, 2, 3]))).toEqual([1, 2])
    expect(Array.from(itt.slice(-100, -10, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(-2, -3, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-2, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([2])
    expect(Array.from(itt.slice(-5, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([5, 4, 3, 2])
    expect(Array.from(itt.slice(-8, -6, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([8, 7])
    expect(Array.from(itt.slice(-3, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([3, 2])
    expect(Array.from(itt.slice(-3, -3, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-3, -6, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-1, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-9, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5, 4, 3, 2])
    expect(Array.from(itt.slice(-4, -4, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-9, -4, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5])
    expect(Array.from(itt.slice(-15, -4, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5])
    expect(Array.from(itt.slice(-9, -9, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-10, -9, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-15, -9, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(-1, -1, I()))).toEqual([])
    expect(Array.from(itt.slice(-3, -1, I()))).toEqual([])
    expect(Array.from(itt.slice(-5, -2, I()))).toEqual([])
    expect(Array.from(itt.slice(-5, -5, I()))).toEqual([])
    expect(Array.from(itt.slice(-1, -6, I()))).toEqual([])
    expect(Array.from(itt.slice(-1, -1, I(1)))).toEqual([])
    expect(Array.from(itt.slice(-2, -1, I(1)))).toEqual([])
    expect(Array.from(itt.slice(-1, -10, I(1)))).toEqual([])
    expect(Array.from(itt.slice(-1, -1, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(-1, -2, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(-2, -1, I(1, 2, 3)))).toEqual([2])
    expect(Array.from(itt.slice(-2, -2, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(-3, -1, I(1, 2, 3)))).toEqual([1, 2])
    expect(Array.from(itt.slice(-3, -2, I(1, 2, 3)))).toEqual([1])
    expect(Array.from(itt.slice(-4, -1, I(1, 2, 3)))).toEqual([1, 2])
    expect(Array.from(itt.slice(-4, -2, I(1, 2, 3)))).toEqual([1])
    expect(Array.from(itt.slice(-5, -1, I(1, 2, 3)))).toEqual([1, 2])
    expect(Array.from(itt.slice(-5, -3, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(-1, -10, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(-100, -1, I(1, 2, 3)))).toEqual([1, 2])
    expect(Array.from(itt.slice(-100, -10, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(-2, -3, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-2, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([2])
    expect(Array.from(itt.slice(-5, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([5, 4, 3, 2])
    expect(Array.from(itt.slice(-8, -6, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([8, 7])
    expect(Array.from(itt.slice(-3, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([3, 2])
    expect(Array.from(itt.slice(-3, -3, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-3, -6, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-1, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-9, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5, 4, 3, 2])
    expect(Array.from(itt.slice(-4, -4, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-9, -4, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5])
    expect(Array.from(itt.slice(-15, -4, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5])
    expect(Array.from(itt.slice(-9, -9, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-10, -9, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-15, -9, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(-15, -12, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
  })
  it('yields a slice when start >= 0 && end < 0', () => {
    expect(Array.from(itt.slice(0, -1, []))).toEqual([])
    expect(Array.from(itt.slice(1, -1, []))).toEqual([])
    expect(Array.from(itt.slice(5, -2, []))).toEqual([])
    expect(Array.from(itt.slice(5, -5, []))).toEqual([])
    expect(Array.from(itt.slice(0, -1, [1]))).toEqual([])
    expect(Array.from(itt.slice(1, -1, [1]))).toEqual([])
    expect(Array.from(itt.slice(3, -10, [1]))).toEqual([])
    expect(Array.from(itt.slice(2, -1, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(1, -2, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(1, -1, [1, 2, 3]))).toEqual([2])
    expect(Array.from(itt.slice(1, -2, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(0, -1, [1, 2, 3]))).toEqual([1, 2])
    expect(Array.from(itt.slice(0, -2, [1, 2, 3]))).toEqual([1])
    expect(Array.from(itt.slice(3, -1, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(3, -3, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(5, -1, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(5, -5, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(3, -10, [1, 2, 3]))).toEqual([])
    expect(Array.from(itt.slice(7, -3, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(5, -3, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([4])
    expect(Array.from(itt.slice(7, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([2])
    expect(Array.from(itt.slice(4, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([5, 4, 3, 2])
    expect(Array.from(itt.slice(1, -6, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([8, 7])
    expect(Array.from(itt.slice(6, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([3, 2])
    expect(Array.from(itt.slice(6, -3, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(6, -6, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(8, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(0, -1, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5, 4, 3, 2])
    expect(Array.from(itt.slice(5, -4, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(10, -4, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(0, -4, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([9, 8, 7, 6, 5])
    expect(Array.from(itt.slice(0, -9, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(0, -12, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(4, -12, [9, 8, 7, 6, 5, 4, 3, 2, 1]))).toEqual([])
    expect(Array.from(itt.slice(0, -1, I()))).toEqual([])
    expect(Array.from(itt.slice(1, -1, I()))).toEqual([])
    expect(Array.from(itt.slice(5, -2, I()))).toEqual([])
    expect(Array.from(itt.slice(5, -5, I()))).toEqual([])
    expect(Array.from(itt.slice(0, -1, I(1)))).toEqual([])
    expect(Array.from(itt.slice(1, -1, I(1)))).toEqual([])
    expect(Array.from(itt.slice(3, -10, I(1)))).toEqual([])
    expect(Array.from(itt.slice(2, -1, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(1, -2, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(1, -1, I(1, 2, 3)))).toEqual([2])
    expect(Array.from(itt.slice(1, -2, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(0, -1, I(1, 2, 3)))).toEqual([1, 2])
    expect(Array.from(itt.slice(0, -2, I(1, 2, 3)))).toEqual([1])
    expect(Array.from(itt.slice(3, -1, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(3, -3, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(5, -1, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(5, -5, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(3, -10, I(1, 2, 3)))).toEqual([])
    expect(Array.from(itt.slice(7, -3, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(5, -3, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([4])
    expect(Array.from(itt.slice(7, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([2])
    expect(Array.from(itt.slice(4, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([5, 4, 3, 2])
    expect(Array.from(itt.slice(1, -6, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([8, 7])
    expect(Array.from(itt.slice(6, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([3, 2])
    expect(Array.from(itt.slice(6, -3, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(6, -6, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(8, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(0, -1, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5, 4, 3, 2])
    expect(Array.from(itt.slice(5, -4, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(10, -4, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(0, -4, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([9, 8, 7, 6, 5])
    expect(Array.from(itt.slice(0, -9, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(0, -12, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
    expect(Array.from(itt.slice(4, -12, I(9, 8, 7, 6, 5, 4, 3, 2, 1)))).toEqual([])
  })
  it('returns an empty iterator when given an empty iterator', () => {
    expect(Array.from(itt.slice([]))).toEqual([])
    expect(Array.from(itt.slice(1, 10, []))).toEqual([])
    expect(Array.from(itt.slice(1, -1, []))).toEqual([])
    expect(Array.from(itt.slice(-1, 10, []))).toEqual([])
    expect(Array.from(itt.slice(-10, -1, []))).toEqual([])
    expect(Array.from(itt.slice(I()))).toEqual([])
    expect(Array.from(itt.slice(1, 10, I()))).toEqual([])
    expect(Array.from(itt.slice(1, -1, I()))).toEqual([])
    expect(Array.from(itt.slice(-1, 10, I()))).toEqual([])
    expect(Array.from(itt.slice(-10, -1, I()))).toEqual([])
  })
})
