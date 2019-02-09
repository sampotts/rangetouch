# RangeTouch

[![npm version](https://badge.fury.io/js/rangetouch.svg)](https://badge.fury.io/js/rangetouch)

A super tiny library to make `<input type="range">` sliders work better on touch devices.

[Donate to support RangeTouch](#donate)

[Checkout the demo](https://rangetouch.com)

## Why?

While building [plyr](https://plyr.io) I noticed how bad the experience was trying to use `<input type="range">` is on a touch device (particularly iOS). Touching the track on a desktop will jump the thumb handle to that point. However on some touch devices this simply focuses the input and to adjust the value you need to touch and drag the handle. This is something that I can't help but feel will eventually be fixed by the browser vendors but for now, you can use RangeTouch to fill that gap.

## Features

-   Less than 1KB minified and gzipped
-   No dependencies (written in "vanilla" JavaScript)
-   Uses event delgation so no need to re-run after DOM manipulation

## Quick setup

### 1. Include the lib

Either use the ES6 module:

```javascript
import RangeTouch from 'rangetouch`;
```

...or include the script:

```html
<script src="https://rangetouch.com/1.0.6/rangetouch.js"></script>
```

### 2. Create an instance

```javascript
const range = new RangeTouch('input[type="range"]', { ...options });
```

## Options

| Name       | Type    | Default | Description                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| addCSS     | Boolean | `true`  | Whether to inject CSS to improve the usability of the inputs. It's recommended you add this yourself if you don't want RangeTouch to take care of it.                                                                                                                                                                                                                          |
| thumbWidth | Integer | `15`    | This value is used as part of the calculation to determine the value the users selects when touching the range track. Unfortunately as JavaScript can't access the shadow DOM, this value can't be automatically determined. I would recommend customisation (and setting the size of the thumb) given all OS and browser combinations seem to render the control differently. |

## Issues

If you find anything weird with RangeTouch, please let us know using the [GitHub issues tracker](https://github.com/sampotts/rangetouch/issues) and be descriptive on how to reproduce, expected result, the browser (and version) used, etc.

## Author

RangeTouch is developed by [@sam_potts](https://twitter.com/sam_potts) / [sampotts.me](http://sampotts.me)

## Donate

RangeTouch costs money to run for domains, hosting and more. Any help is appreciated...
[Donate to support RangeTouch](https://www.paypal.me/pottsy/20usd)

## Thanks

[![Fastly](https://cdn.plyr.io/static/fastly-logo.png)](https://www.fastly.com/)

Thanks to [Fastly](https://www.fastly.com/) for providing the CDN services.

## Copyright and License

[The MIT license](license.md).
