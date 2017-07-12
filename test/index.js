const optimize = require('..')
const Spike = require('spike-core')
const test = require('ava')
const path = require('path')
const fs = require('fs')
const fixtures = path.join(__dirname, 'fixtures')

test.cb('full functionality', (t) => {
  const rootPath = path.join(fixtures, 'basic')
  const project = new Spike({
    root: rootPath,
    entry: { main: './index.js', second: './secondary.js' },
    afterSpikePlugins: [...optimize({
      scopeHoisting: true,
      aggressiveSplitting: true,
      minify: true
    })]
  })

  project.on('error', t.end)
  project.on('warning', t.end)
  project.on('compile', (res) => {
    const pub = path.join(rootPath, 'public')
    const outputFiles = fs.readdirSync(pub).filter((n) => n !== 'index.html')
    const html = fs.readFileSync(path.join(pub, 'index.html'), 'utf8')
    outputFiles.map((f) => {
      t.regex(html, new RegExp(f))
    })
    t.end()
  })

  project.compile()
})
