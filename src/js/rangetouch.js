// ==========================================================================
// rangetouch.js v0.0.1
// Making <input type="range"> work on touch devices
// https://github.com/selz/rangetouch
// License: The MIT License (MIT)
// ==========================================================================

;(function(root, factory) {
    'use strict';
    /*global define,module*/

    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(root, document);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(null, function() { factory(root, document); });
    } else {
        // Browser globals (root is window)
        root.rangetouch = factory(root, document);
    }
}(typeof window !== 'undefined' ? window : this, function(window, document) {
    'use strict';

    // Default config
    var settings = {
        enabled:        true,
        selectors: {
            range:      '[type="range"]'
        },
        thumbWidth:     15,
        events: {
            start:      'touchstart',
            move:       'touchmove'
        }
    };

    // Bind an event listener
    function _on(element, type, listener) {
        element.addEventListener(type, listener, false);
    }

    // Round to the nearest step
    function roundToStep(number, step) {
        if(step < 1) {
            var places = parseInt(step).getDecimalCount();
            return parseFloat(number.toFixed(places));
        }
        return (Math.round(number / step) * step);
    }

    // Get the value based on touch position
    function getValue(event) {
        var input   = event.target,
            touch   = event.changedTouches[0],
            min     = parseFloat(input.getAttribute('min')) || 0,
            max     = parseFloat(input.getAttribute('max')) || 100,
            step    = parseFloat(input.getAttribute('step')) || 1,
            delta   = max - min;

        // Calculate percentage
        var percent,
            clientRect              = input.getBoundingClientRect(),
            thumbWidthPercentage    = (((100 / clientRect.width) * (settings.thumbWidth / 2)) / 100);

        // Determine left percentage
        percent = ((100 / clientRect.width) * (touch.pageX - clientRect.left));

        // Don't allow outside bounds
        if (percent < 0) { percent = 0; }
        else if (percent > 100) { percent = 100; }

        // Find the closest step to the mouse position
        return roundToStep(delta * (percent / 100), step);
    }
    
    // Update range value based on position
    function setValue(event) {
        // If not enabled, bail
        if(!settings.enabled) {
            return;
        }

        // Set value
        event.target.value = getValue(event);
    }

    // Event listeners
    function listeners() {
        _on(document.body, settings.events.start, setValue);
        _on(document.body, settings.events.move, setValue);
    }

    // Expose setup function
    (function() {
        // Bail if not a touch device
        if (!('ontouchstart' in document.documentElement)) {
            return;
        }

        // Find all inputs
        var inputs = document.querySelectorAll(settings.selectors.range);

        // Set touchAction to prevent delays
        for (var i = inputs.length - 1; i >= 0; i--) {
            inputs[i].style.touchAction = 'manipulation';
        }

        // Listen for events
        listeners();
    })();

    return {
        set: function(setting, value) {
            settings[setting] = value;
        }
    };
}));
