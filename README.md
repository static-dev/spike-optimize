# Spike Optimization Plugin

[![npm](https://img.shields.io/npm/v/spike-optimize.svg?style=flat-square)](https://npmjs.com/package/spike-optimize)
[![tests](https://img.shields.io/travis/static-dev/spike-optimize.svg?style=flat-square)](https://travis-ci.org/static-dev/spike-optimize?branch=master)
[![dependencies](https://img.shields.io/david/static-dev/spike-optimize.svg?style=flat-square)](https://david-dm.org/static-dev/spike-optimize)
[![coverage](https://img.shields.io/codecov/c/github/static-dev/spike-optimize.svg?style=flat-square)](https://codecov.io/gh/static-dev/spike-optimize)

A plugin that provides bleeding edge performance optimizations for spike.

> **Note:** This project is in early development, and versioning is a little different. [Read this](http://markup.im/#q4_cRZ1Q) for more details.

### Installation

`npm install spike-optimize -S`

### Usage

Currently, spike-optimize provides a simple interface through which you can enable scope hoisting, aggressive splitting for http/2, and hashed asset processing -- features that are on the more advanced side of webpack configuration, but which can be set up with simple boolean options through this plugin. For example:

```js
const optimize = require('spike-optimize')

module.exports = {
  // ... your config ...
  afterSpikePlugins: [
    ...optimize({
      scopeHoisting: true,
      minify: true,
      aggressiveSplitting: true // or set your size limits ex. [30000, 50000]
    })
  ]
}
```

> NOTE: Notice that optimize actually returns an array of plugins, so the instantiation is slightly different here.

Out of the box, this plugin will force webpack to use [chunkhash naming](https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95) optimized for long term cacheing. Now, as soon as you are using hash naming, you no longer have a way to include the scripts on your page, since they are named randomly. However, this plugin will scan your pages and detect when you are using the assets as they are named in your entries automatically, then replace them with the correct path. So you can still include the script like this:

```html
<body>
  <!--  ... your code ... -->
  <script src='/js/main.js'></script>
</body>
```

Any scripts that webpack processes will be transformed such that the naming is correct if you are using hash naming, and if it has been split into multiple outputs, it will be replaced by multiple script tags. So for example, if you have `aggressiveSplitting` set to `true`, your result might look like this:

```html
<body>
  <!--  ... your code ... -->
  <script src='/js/kj2b34k32b44nio.js'></script>
  <script src='/js/nro32uuwebfssdf.js'></script>
  <script src='/js/n23ouenwoubsfd3.js'></script>
</body>
```

In this case, your bundle has been split into a couple files to optimize http/2 load speed, and each file has been renamed to a hash. If you just use the plugin with default settings, it won't split your output and it will look more like this:

```html
<body>
  <!--  ... your code ... -->
  <script src='/js/kj2b34k32b44nio.js'></script>
</body>
```

Note that at the moment, these optimizations are only available for javascript, not css. Aggressive splitting and hash naming could be marginally useful for css, and I will consider adding this in the future. In the meantime, PRs accepted!

Also note that this plugin will significantly slow down compilation due to the extra optimizations, and is only recommended to be used in production (but please test it locally before going live).

### Options

| Name | Description | Default |
| ---- | ----------- | ------- |
| **scopeHoisting** | Configures webpack to use [scope hoisting](https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f). | |
| **aggressiveSplitting** | Configures webpack to use [aggressive splitting](https://medium.com/webpack/webpack-http-2-7083ec3f3ce6) for optimized h2. | |
| **minify** | Activates the uglifyjs plugin for minifying your js | |

### License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)
