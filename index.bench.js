const itt = require('.')
const benchmark = require('benchmark')

const s = '1,'.repeat(1000000) + '1'

const suite = new benchmark.Suite()
.add('native', () => {
  // s.split(',').reduce((a, b) => a + b, 0)
  // Array(10000).fill(0).map(x => x + 1)
  Array(100000).fill(0)
  .map(x => x + 1)
  .filter(x => x % 7 !== 1)
  .reduce((a, b) => a + b, 0)
})
.add('itt', () => {
  // itt.split(s, ',').sum()
  // itt.replicate(10000, 0).map(x => x + 1).toArray()
  itt.replicate(100000, 0)
  .map(x => x + 1)
  .filter(x => x % 7 !== 1)
  .sum()
})
.on('error', event => console.log(event.target.error.stack))
.on('cycle', event => console.log(''+event.target))
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'))
})
.run({ 'async': true });
