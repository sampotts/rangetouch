// ==========================================================================
// rangetouch.js v0.0.9
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
            range:      '[type="range"]',
            disabled:   'rangetouch--disabled'
        },
        thumbWidth:     15,
        events: {
            start:      'touchstart',
            move:       'touchmove',
            end:        'touchend'
        }
    };

    // Check if element is disabled 
    function isDisabled(element) {
        if(element instanceof HTMLElement) {
            return element.classList.contains(settings.selectors.disabled);
        }
        return false;
    }

    // Bind an event listener
    function on(element, type, listener) {
        element.addEventListener(type, listener, false);
    }

    // Get the number of decimal places
    function getDecimalPlaces(value) {
        var match = ('' + value).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

        if (!match) { return 0; }

        return Math.max(
            0,
            // Number of digits right of decimal point.
            (match[1] ? match[1].length : 0) -
            // Adjust for scientific notation.
            (match[2] ? +match[2] : 0)
        );
    }

    // Round to the nearest step
    function roundToStep(number, step) {
        if(step < 1) {
            var places = getDecimalPlaces(step);
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
            clientRect   = input.getBoundingClientRect(),
            thumbWidth   = (((100 / clientRect.width) * (settings.thumbWidth / 2)) / 100);

        // Determine left percentage
        percent = ((100 / clientRect.width) * (touch.clientX - clientRect.left));

        // Don't allow outside bounds
        if (percent < 0) { percent = 0; }
        else if (percent > 100) { percent = 100; }

        // Factor in the thumb offset 
        if(percent < 50) {
            percent -= ((100 - (percent * 2)) * thumbWidth);
        }
        else if(percent > 50) {
            percent += (((percent - 50) * 2) * thumbWidth);
        }

        // Find the closest step to the mouse position
        return min + roundToStep(delta * (percent / 100), step);
    }
    
    // Update range value based on position
    function setValue(event) {
        // If not enabled, bail
        if (!settings.enabled || event.target.type !== 'range' || isDisabled(event.target)) {
            return;
        }

        // Prevent text highlight on iOS
        event.preventDefault();

        // Set value
        event.target.value = getValue(event);

        // Trigger input event
        _triggerEvent(event.target, (event.type === settings.events.end ? 'change' : 'input'));
    }

    // Event listeners
    function listeners() {
        on(document.body, settings.events.start, setValue);
        on(document.body, settings.events.move, setValue);
        on(document.body, settings.events.end, setValue);
    }

    // Trigger event
    function _triggerEvent(element, eventName, properties) {
        element.dispatchEvent(new CustomEvent(eventName, properties));
    }

    // Get the selector for the range
    function getSelector() {
        return [settings.selectors.range, ":not(.", settings.selectors.disabled, ")"].join("");
    }

    // Expose setup function
    (function() {
        // Bail if not a touch device
        if (!('ontouchstart' in document.documentElement)) {
            return;
        }

        // Find all inputs
        var inputs = document.querySelectorAll(getSelector());

        // Set touchAction to prevent delays
        for (var i = inputs.length - 1; i >= 0; i--) {
            inputs[i].style.touchAction = 'manipulation';
            inputs[i].style.webkitUserSelect = 'none';
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

// Custom event polyfill
// ---------------------------------
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
(function () {
    'use strict';
    
    if (typeof window.CustomEvent === 'function') {
        return false;
    }

    function CustomEvent (event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
