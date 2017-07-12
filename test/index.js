const optimize = require('..')
const Spike = require('spike-core')
const test = require('ava')
const path = require('path')
const fixtures = path.join(__dirname, 'fixtures')

test.cb('basic', (t) => {
  const project = new Spike({
    root: path.join(fixtures, 'basic'),
    entry: { main: './index.js', second: './secondary.js' },
    afterSpikePlugins: [...optimize({
      scopeHoisting: true,
      aggressiveSplitting: true,
      hashNaming: true,
      minify: true
    })]
  })

  project.on('error', t.end)
  project.on('warning', t.end)
  project.on('compile', (res) => {
    t.end()
  })

  project.compile()
})
