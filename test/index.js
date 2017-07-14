const optimize = require('..')
const Spike = require('spike-core')
const test = require('ava')
const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf-promise')
const fixtures = path.join(__dirname, 'fixtures')

test('full functionality', (t) => {
  return compileProject('basic', {
    entry: { main: './index.js', second: './secondary.js' },
    afterSpikePlugins: [...optimize({
      scopeHoisting: true,
      aggressiveSplitting: true,
      minify: true
    })]
  }).then(({ publicPath }) => {
    const outputFiles = fs.readdirSync(publicPath).filter((n) => n !== 'index.html')
    const html = fs.readFileSync(path.join(publicPath, 'index.html'), 'utf8')
    outputFiles.map((f) => { t.regex(html, new RegExp(f)) })
    return rimraf(publicPath)
  })
})

test('only scope hoisting option', (t) => {
  return compileProject('basic', {
    entry: { main: './index.js' },
    afterSpikePlugins: [...optimize({ scopeHoisting: true })]
  }).then(({ publicPath, stats }) => {
    const filenames = Object.keys(stats.compilation.assets)
    t.is(filenames.length, 2)
    t.regex(filenames[0], /main\..*\.js/)
    const index = stats.compilation.assets['index.html'].source()
    t.regex(index, /\/\/ webpackBootstrap/)
    t.regex(index, /script src="\/main\..*\.js"/)
    return rimraf(publicPath)
  })
})

test('only aggressive splitting option', (t) => {
  return compileProject('basic', {
    entry: { main: './index.js' },
    afterSpikePlugins: [...optimize({ aggressiveSplitting: true })]
  }).then(({ publicPath, stats }) => {
    const filenames = Object.keys(stats.compilation.assets)
    t.is(filenames.length, 4)
    const index = stats.compilation.assets['index.html'].source()
    t.regex(index, /\/\/ webpackBootstrap/)
    t.regex(index, /script src="\/0\..*\.js"/)
    t.regex(index, /script src="\/1\..*\.js"/)
    t.regex(index, /script src="\/2\..*\.js"/)
    return rimraf(publicPath)
  })
})

test.only('aggressive splitting size params', (t) => {
  return compileProject('basic', {
    entry: { main: './index.js' },
    afterSpikePlugins: [...optimize({ aggressiveSplitting: [5000, 10000] })]
  }).then(({ publicPath, stats }) => {
    const filenames = Object.keys(stats.compilation.assets)
    t.is(filenames.length, 14)
    return rimraf(publicPath)
  })
})

test('only minify option', (t) => {
  return compileProject('basic', {
    entry: { main: './index.js' },
    afterSpikePlugins: [...optimize({ minify: true })]
  }).then(({ publicPath, stats }) => {
    const filenames = Object.keys(stats.compilation.assets)
    t.is(filenames.length, 2)
    const index = stats.compilation.assets['index.html'].source()
    t.regex(index, /window\.webpackJsonp/)
    t.regex(index, /script src="\/main\..*\.js"/)
    return rimraf(publicPath)
  })
})

// utility function
function compileProject (name, config) {
  return new Promise((resolve, reject) => {
    const root = path.join(fixtures, name)
    const project = new Spike(Object.assign({ root }, config))

    project.on('error', reject)
    project.on('warning', reject)
    project.on('compile', (res) => {
      resolve({ publicPath: path.join(root, 'public'), stats: res.stats })
    })

    project.compile()
  })
}
