# [jQuery asScrollable](https://github.com/amazingSurge/jquery-asScrollable) ![bower][bower-image] [![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![prs-welcome]](#contributing)

> A jquery plugin that make a block element scrollable.

## Table of contents
- [Main files](#main-files)
- [Quick start](#quick-start)
- [Requirements](#requirements)
- [Usage](#usage)
- [Examples](#examples)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)
- [No conflict](#no-conflict)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [Development](#development)
- [Changelog](#changelog)
- [Copyright and license](#copyright-and-license)

## Main files
```
dist/
├── jquery-asScrollable.js
├── jquery-asScrollable.es.js
├── jquery-asScrollable.min.js
└── css/
    ├── asScrollable.css
    └── asScrollable.min.css
```

## Quick start
Several quick start options are available:
#### Download the latest build

 * [Development](https://raw.githubusercontent.com/amazingSurge/jquery-asScrollable/master/dist/jquery-asScrollable.js) - unminified
 * [Production](https://raw.githubusercontent.com/amazingSurge/jquery-asScrollable/master/dist/jquery-asScrollable.min.js) - minified

#### Install From Bower
```sh
bower install jquery-asScrollable --save
```

#### Install From Npm
```sh
npm install jquery-asScrollable --save
```

#### Install From Yarn
```sh
yarn add jquery-asScrollable
```

#### Build From Source
If you want build from source:

```sh
git clone git@github.com:amazingSurge/jquery-asScrollable.git
cd jquery-asScrollable
npm install
npm install -g gulp-cli babel-cli
gulp build
```

Done!

## Requirements
`jquery-asScrollable` requires the latest version of [`jQuery`](https://jquery.com/download/), [`jquery-asScollbar`](https://github.com/amazingSurge/jquery-asScrollbar).

## Usage
#### Including files:

```html
<link rel="stylesheet" href="/path/to/asScrollbar.css">
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery-asScrollbar.js"></script>
<script src="/path/to/jquery-asScrollable.js"></script>
```

#### Required HTML structure

```html
<div class="example">
  content here
</div>
```

#### Initialization
All you need to do is call the plugin on the element:

```javascript
jQuery(function($) {
  $('.example').asScrollable(); 
});
```

### Better Usage
If we supply two wrap div for the content, the dom will not redraw which having better performances.

```html
<div class="example">
    <div>
        <div>
            content here
        </div>
    </div>
</div>

<script>
jQuery(function($) {
  $('.example').asScrollable({
    contentSelector: '>',
    containerSelector: '>'
  });
});
</script>
```

## Examples
There are some example usages that you can look at to get started. They can be found in the
[examples folder](https://github.com/amazingSurge/jquery-asScrollable/tree/master/examples).

## Options
`jquery-asScrollable` can accept an options object to alter the way it behaves. You can see the default options by call `$.asScrollable.setDefaults()`. The structure of an options object is as follows:

```
{
  namespace: 'asScrollable',

  skin: null,

  contentSelector: null,
  containerSelector: null,

  enabledClass: 'is-enabled',
  disabledClass: 'is-disabled',

  draggingClass: 'is-dragging',
  hoveringClass: 'is-hovering',
  scrollingClass: 'is-scrolling',

  direction: 'vertical', // vertical, horizontal, both, auto

  showOnHover: true,
  showOnBarHover: false,

  duration: 500,
  easing: 'ease-in', // linear, ease, ease-in, ease-out, ease-in-out

  responsive: true,
  throttle: 20,

  scrollbar: {}
}
```

## Methods
Methods are called on asScrollable instances through the asScrollable method itself.
You can also save the instances to variable for further use.

```javascript
// call directly
$().asScrollable('destroy');

// or
var api = $().data('asScrollable');
api.destroy();
```

#### scrollTo(direction, position)
Scroll the content to position in direction.
```javascript
// scroll to 50px in vertical
$().asScrollable('scrollTo', 'vertical', '50');

// scroll to 50% in horizontal
$().asScrollable('scrollTo', 'horizontal', '50%');
```

#### scrollBy(direction, size)
Scroll the content by the size.
```javascript
$().asScrollable('scrollBy', 'vertical', '10');
$().asScrollable('scrollBy', 'horizontal', '10%');

$().asScrollable('scrollBy', 'vertical', '-10');
$().asScrollable('scrollBy', 'horizontal', '-10%');
```

#### enable()
Enable the scrollable functions.
```javascript
$().asScrollable('enable');
```

#### disable()
Disable the scrollable functions.
```javascript
$().asScrollable('disable');
```

#### destroy()
Destroy the scrollable instance.
```javascript
$().asScrollable('destroy');
```

## Events
`jquery-asScrollable` provides custom events for the plugin’s unique actions. 

```javascript
$('.the-element').on('asScrollable::ready', function (e) {
  // on instance ready
});

```

Event   | Description
------- | -----------
ready   | Fires when the instance is ready for API use.
enable  | Fired when the `enable` instance method has been called.
disable | Fired when the `disable` instance method has been called.
destroy | Fires when an instance is destroyed. 

## No conflict
If you have to use other plugin with the same namespace, just call the `$.asScrollable.noConflict` method to revert to it.

```html
<script src="other-plugin.js"></script>
<script src="jquery-asScrollable.js"></script>
<script>
  $.asScrollable.noConflict();
  // Code that uses other plugin's "$().asScrollable" can follow here.
</script>
```

## Browser support

Tested on all major browsers.

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_32x32.png" alt="Safari"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_32x32.png" alt="Chrome"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_32x32.png" alt="Firefox"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/edge/edge_32x32.png" alt="Edge"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_32x32.png" alt="IE"> | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/opera/opera_32x32.png" alt="Opera"> |
|:--:|:--:|:--:|:--:|:--:|:--:|
| Latest ✓ | Latest ✓ | Latest ✓ | Latest ✓ | 9-11 ✓ | Latest ✓ |

As a jQuery plugin, you also need to see the [jQuery Browser Support](http://jquery.com/browser-support/).

## Contributing
Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md). Make sure you're using the latest version of `jquery-asScrollable` before submitting an issue. There are several ways to help out:

* [Bug reports](CONTRIBUTING.md#bug-reports)
* [Feature requests](CONTRIBUTING.md#feature-requests)
* [Pull requests](CONTRIBUTING.md#pull-requests)
* Write test cases for open bug issues
* Contribute to the documentation

## Development
`jquery-asScrollable` is built modularly and uses Gulp as a build system to build its distributable files. To install the necessary dependencies for the build system, please run:

```sh
npm install -g gulp
npm install -g babel-cli
npm install
```

Then you can generate new distributable files from the sources, using:
```
gulp build
```

More gulp tasks can be found [here](CONTRIBUTING.md#available-tasks).

## Changelog
To see the list of recent changes, see [Releases section](https://github.com/amazingSurge/jquery-asScrollable/releases).

## Copyright and license
Copyright (C) 2016 amazingSurge.

Licensed under [the LGPL license](LICENSE).

[⬆ back to top](#table-of-contents)

[bower-image]: https://img.shields.io/bower/v/jquery-asScrollable.svg?style=flat
[bower-link]: https://david-dm.org/amazingSurge/jquery-asScrollable/dev-status.svg
[npm-image]: https://badge.fury.io/js/jquery-asScrollable.svg?style=flat
[npm-url]: https://npmjs.org/package/jquery-asScrollable
[license]: https://img.shields.io/npm/l/jquery-asScrollable.svg?style=flat
[prs-welcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
[daviddm-image]: https://david-dm.org/amazingSurge/jquery-asScrollable.svg?style=flat
[daviddm-url]: https://david-dm.org/amazingSurge/jquery-asScrollable
