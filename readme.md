# RangeTouch
A super tiny library to make `<input type="range">` sliders work better on touch devices.

[Checkout the demo](https://rangetouch.com)

## Why?
While building [plyr](https://plyr.io) I noticed how bad the experience was trying to use `<input type="range">` is on a touch device (particularly iOS). Touching the track on a desktop will jump the thumb handle to that point. However on some touch devices this simply focuses the input and to adjust the value you need to touch and drag the handle. This is something that I can't help but feel will eventually be fixed by the browser vendors but for now, you can use RangeTouch to fill that gap.

## Features
- No setup required, just include the script
- Less than 1KB minified and gzipped
- No dependencies (written in "vanilla" JavaScript)

## Quick setup
To use RangeTouch, you just need to add `rangetouch.js` (either from the `/dist` (minified) or `/src/js` (unminified) folders) before the closing `</body>` tag like so:
```html
<script src="/path/to/rangetouch.js"></script>
```
It will automatically bind to all `<input type="range">` elements, even newlt injected ones. 

### CDN
You can even load RangeTouch from our CDN if you'd like:
```html
<script src="https://cdn.rangetouch.com/0.0.8/rangetouch.js"></script>
```

### Node Package Manager (NPM)
[![npm version](https://badge.fury.io/js/rangetouch.svg)](https://badge.fury.io/js/rangetouch) 

Using NPM, you can grab RangeTouch:
```
npm install rangetouch
```
[https://www.npmjs.com/package/rangetouch](https://www.npmjs.com/package/rangetouch)

### Bower
[![Bower version](https://badge.fury.io/bo/rangetouch.svg)](https://badge.fury.io/bo/rangetouch)

If bower is your thang, you can grab RangeTouch using:
```
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

## Issues
If you find anything weird with RangeTouch, please let us know using the GitHub issues tracker.

## Author
RangeTouch is developed by [@sam_potts](https://twitter.com/sam_potts) / [sampotts.me](http://sampotts.me)

## Copyright and License
[The MIT license](license.md).
