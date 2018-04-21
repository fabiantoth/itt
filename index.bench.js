const itt = require('.')
const benchmark = require('benchmark')

const suite = new benchmark.Suite()
.add('native', () => {
  // Array(10000).fill(0).map(x => x + 1)
  Array(10000).fill(0)
  .map(x => x + 1)
  .filter(x => x % 7 !== 1)
  .reduce((a, b) => a + b, 0)
})
.add('itt', () => {
  // itt(Array(10000).fill(0)).map(x => x + 1).toArray()
  itt(Array(10000).fill(0))
  .map(x => x + 1)
  .filter(x => x % 7 !== 1)
  .reduce((a, b) => a + b, 0)
})
.on('error', event => console.log(event.target.error.stack))
.on('cycle', event => console.log(''+event.target))
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'))
})
.run({ 'async': true });
