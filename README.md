# Spike Optimization Plugin

[![Greenkeeper badge](https://badges.greenkeeper.io/static-dev/spike-optimize.svg)](https://greenkeeper.io/)

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
const Optimize = require('spike-optimize')

module.exports = {
  // ... your config ...
  plugins: [
    new Optimize({
      scopeHoisting: true,
      aggressiveSplitting: true, // or set your size limits ex. [30000, 50000]
      hashNaming: true
    })
  ]
}
```

Now, as soon as you are using hash naming, you no longer have a way to include the scripts on your page, since they are named randomly. As such, the plugin provides a helper in the form of a custom element that gets post-processed by reshape. It looks like this:

```html
<body>
  <!--  ... your code ... -->
  <js>
    <script src='/js/main.js'></script>
  </js>
</body>
```

Anything inside the webpack-assets block with be transformed such that the naming is correct if you are using hash naming, and if not it is transparent, and will remove itself in your final build, leaving its contents behind. So for example, if you had `hashNaming` and `aggressiveSplitting` set to `true`, your result might look like this:

```html
<body>
  <!--  ... your code ... -->
  <script src='/js/kj2b34k32b44nio.js'></script>
  <script src='/js/nro32uuwebfssdf.js'></script>
  <script src='/js/n23ouenwoubsfd3.js'></script>
</body>
```

In this case, your bundle has been split into a couple files to optimize http/2 load speed, and each file has been renamed to a hash. If you had those two options disabled, however, it would look like this:

```html
<body>
  <!--  ... your code ... -->
  <script src='/js/main.js'></script>
</body>
```

Note that at the moment, these optimizations are only available for javascript, not css. Aggressive splitting and hash naming could be marginally useful for css, and I will consider adding this in the future. In the meantime, PRs accepted!

Also note that this plugin will significantly slow down compilation due to the extra optimizations, and is only recommended to be used in production.

### Options

| Name | Description | Default |
| ---- | ----------- | ------- |
| **scopeHoisting** | Configures webpack to use [scope hoisting](https://medium.com/webpack/brief-introduction-to-scope-hoisting-in-webpack-8435084c171f). | |
| **aggressiveSplitting** | Configures webpack to use [aggressive splitting](https://medium.com/webpack/webpack-http-2-7083ec3f3ce6) for optimized h2. | |
| **hashNaming** | Configures webpack to name your javascript output based on [hashes of their contents](https://medium.com/@okonetchnikov/long-term-caching-of-static-assets-with-webpack-1ecb139adb95). | |
| **customElementName** | Name of the custom element wrapper used to transform script names. | `js` |

### License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)
