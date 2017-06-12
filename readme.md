# RangeTouch
A super tiny library to make `<input type="range">` sliders work better on touch devices.

[Donate to support RangeTouch](#donate)

[Checkout the demo](https://rangetouch.com)

## Why?
While building [plyr](https://plyr.io) I noticed how bad the experience was trying to use `<input type="range">` is on a touch device (particularly iOS). Touching the track on a desktop will jump the thumb handle to that point. However on some touch devices this simply focuses the input and to adjust the value you need to touch and drag the handle. This is something that I can't help but feel will eventually be fixed by the browser vendors but for now, you can use RangeTouch to fill that gap.

## Features
- No setup required, just include the script
- Less than 1KB minified and gzipped
- No dependencies (written in "vanilla" JavaScript)

## Quick setup
To use RangeTouch, you just need to add `rangetouch.js` (either from the `/dist` (minified) or `/src/js` (unminified) folders). Ideally before the closing `</body>` tag:

```html
<script src="/path/to/rangetouch.js" async></script>
```

It will automatically bind to all `<input type="range">` elements, even newly injected ones as it uses event delegation.

### CDN
You can load RangeTouch from our CDN (backed by the awesome [Fastly](https://www.fastly.com/)) if you'd like:

```html
<script src="https://cdn.rangetouch.com/1.0.4/rangetouch.js" async></script>
```

### Node / NPM
[![npm version](https://badge.fury.io/js/rangetouch.svg)](https://badge.fury.io/js/rangetouch)

Using NPM, you can grab RangeTouch:

```bash
npm install rangetouch
```

[https://www.npmjs.com/package/rangetouch](https://www.npmjs.com/package/rangetouch)

### Bower

[![Bower version](https://badge.fury.io/bo/rangetouch.svg)](https://badge.fury.io/bo/rangetouch)

If bower is your thang, you can grab RangeTouch using:

```bash
bower install rangetouch
```

[http://bower.io/search/?q=rangetouch](http://bower.io/search/?q=rangetouch)

More info on setting up dependencies can be found in the [Bower Docs](http://bower.io/docs/creating-packages/#maintaining-dependencies)

## Configuration
If you're customizing your range inputs (easily done - see the demo for an example) and you change the size of the thumb handle, you should specify (in pixels) this after including the script:

```javascript
window.rangetouch.set("thumbWidth", 15);
```

This value is used as part of the calculation to determine the value the users selects when touching the range track. Unfortunately as JavaScript can't access the shadow DOM, this value can't be automatically determined. I would recommend customisation (and setting the size of the thumb) given all OS and browser combinations seem to render the control differently (as per usual).

If you want to disable RangeTouch for a particular input, add the `rangetouch--disabled` class name to the element.

## Issues
If you find anything weird with RangeTouch, please let us know using the GitHub issues tracker.

## Author
RangeTouch is developed by [@sam_potts](https://twitter.com/sam_potts) / [sampotts.me](http://sampotts.me)

## Donate
RangeTouch costs money to run, not my time - I donate that for free but domains, hosting and more. Any help is appreciated...
[Donate to support RangeTouch](https://www.paypal.me/pottsy/20usd)

## Thanks
[![Fastly](https://www.fastly.com/sites/all/themes/custom/fastly2016/logo.png)](https://www.fastly.com/)

Thanks to [Fastly](https://www.fastly.com/) for providing the CDN services.

## Copyright and License
[The MIT license](license.md).
