# metalsmith-prefixoid [![npm version](https://badge.fury.io/js/metalsmith-prefixoid.png)](http://badge.fury.io/js/metalsmith-prefixoid) [![Build Status](https://travis-ci.org/quizzz-and-chiv/metalsmith-prefixoid.png)](https://travis-ci.org/quizzz-and-chiv/metalsmith-prefixoid)

This is a [metalsmith](https://github.com/segmentio/metalsmith) plugin which prefixizes internal urls.

Let prefix be `/pref`. In this case plugin will work by following way:

* `http://example.com/sub/dir/` -> `http://example.com/sub/dir/` (doesn't change)
* `../relative/path` -> `../relative/path` (doesn't change)
* `another/relative/path` -> `another/relative/path` (doesn't change)
* `/internal/absolute/path` -> `/pref/internal/absolute/path` **(prefixizes)**


## Usage
```js
var prefixoid = require('metalsmith-prefixoid');

Metalsmith(__dirname)
  .use(markdown())
  .use(templates('handlebars'))

  .use(prefixoid({
    prefix: '/base_url'
  }))
  .build(function(err) {
    if (err) throw err;
  });
```

## Options

* `meta: 'some.name.space'` - (optional) will take prefix from `metalsmith.metadata().some.name.space`
* `prefix: '/base/url'` - (optional) take prefix from config. One of `meta` or `prefix` is required.
* `selector: 'script'` - (optional, default: 'a') transforms only selected elements
* `attr: 'src'` - (optional, default: 'href') attr with URL to modify
* `span_currents: true` - (optional) will replace links to current page with <span> elements.
* `links_class: 'a-link'` - css class of <a> links.
* `spans_class: 'span-link'` - css class of spans which were links.
* `all_links_class: 'all-link'` - css class of every link processed with plugin

Very optional options:
* `is_current: function(current_url, url)` - (optional) will recognize if link is current. By default it takes equality to one of options:
    * `current_url`
    * `current_url + '/'`
    * `current_url + '/index.html'`
* `transform: function` - (optional) Check if url must be transformed and transforms url. By default it works as described above however any logic may be here.


## Config example: 
```js
...
  .use(react_templates({
    directory: 'templates',
    baseFile: 'base.html',
    nonStatic: true
  }))
  .use(prefixoid({
    meta: 'site.base_path',
    span_currents: true,
    links_class: 'omich-link_a',
    spans_class: 'omich-link_current',
    all_links_class: 'omich-link'
  }))
  .use(prefixoid({
    meta: 'site.base_path',
    selector: 'link',
    attr: 'href'
  }))
  .use(prefixoid({
    meta: 'site.base_path',
    selector: 'script',
    attr: 'src'
  }))
  .build(function(err) {
    if (err) {
      throw err;
    }
  });
```



## License
The MIT License (MIT)

Copyright (c) 2015 Chivorotkiv <chivorotkiv@omich.net>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
