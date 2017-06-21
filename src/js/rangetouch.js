// ==========================================================================
// rangetouch.js v1.0.5
// Making <input type="range"> work on touch devices
// https://github.com/selz/rangetouch
// License: The MIT License (MIT)
// ==========================================================================

(function(root, factory) {
    'use strict';
    /*global define,module*/

    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(root, document);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(null, function() {
            factory(root, document);
        });
    } else {
        // Browser globals (root is window)
        root.rangetouch = factory(root, document);
    }
}(typeof window !== 'undefined' ? window : this, function(window, document) {
    'use strict';

    // Default config
    var settings = {
        enabled: true,
        addCSS: true,
        thumbWidth: 15,
        selectors: {
            range: '[type="range"]',
            disabled: '.rangetouch--disabled'
        },
        events: {
            start: 'touchstart',
            move: 'touchmove',
            end: 'touchend'
        }
    };

    // Setup
    function setup() {
        // Bail if not a touch enabled device
        if (!('ontouchstart' in document.documentElement)) {
            return;
        }

        // Add useful CSS
        if (settings.addCSS) {
            var stylesheets = document.styleSheets;
            var stylesheet = stylesheets.length ? stylesheets[0] : createStyleSheet();
            stylesheet.insertRule(getSelector() + ' { user-select: none; -webkit-user-select: none; touch-action: manipulation; }', 0);
        }

        // Listen for events
        listeners();
    }

    // Event listeners
    function listeners() {
        on(document.body, settings.events.start, set);
        on(document.body, settings.events.move, set);
        on(document.body, settings.events.end, set);
    }

    // Create a CSS stylesheet
    function createStyleSheet() {
        var style = document.createElement("style");
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);
        return style.sheet;
    }

    // Trigger event
    function trigger(element, type, properties) {
        // Bail if no element
        if (!element || !type) {
            return;
        }

        // Create CustomEvent constructor
        var CustomEvent;
        if (typeof window.CustomEvent === 'function') {
            CustomEvent = window.CustomEvent;
        } else {
            // Polyfill CustomEvent
            // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
            CustomEvent = function(event, params) {
                params = params || {
                    bubbles: false,
                    cancelable: false,
                    detail: undefined
                };
                var custom = document.createEvent('CustomEvent');
                custom.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return custom;
            };
            CustomEvent.prototype = window.Event.prototype;
        }

        // Create and dispatch the event
        var event = new CustomEvent(type, {
            bubbles: true,
            detail: properties
        });

        // Dispatch the event
        element.dispatchEvent(event);
    }

    // Get the selector for the range
    function getSelector() {
        return [settings.selectors.range, ":not(", settings.selectors.disabled, ")"].join("");
    }

    // Check if element is disabled
    function isDisabled(element) {
        if (element instanceof HTMLElement) {
            return element.matches(settings.selectors.disabled) || element.disabled;
        }

        return true;
    }

    // Bind an event listener
    function on(element, type, listener) {
        element.addEventListener(type, listener, false);
    }

    // Get the number of decimal places
    function getDecimalPlaces(value) {
        var match = ('' + value).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

        if (!match) {
            return 0;
        }

        return Math.max(
            0,
            // Number of digits right of decimal point.
            (match[1] ? match[1].length : 0) -
            // Adjust for scientific notation.
            (match[2] ? +match[2] : 0)
        );
    }

    // Round to the nearest step
    function round(number, step) {
        if (step < 1) {
            var places = getDecimalPlaces(step);
            return parseFloat(number.toFixed(places));
        }
        return (Math.round(number / step) * step);
    }

    // Get the value based on touch position
    function get(event) {
        var input = event.target;
        var touch = event.changedTouches[0];
        var min = parseFloat(input.getAttribute('min')) || 0;
        var max = parseFloat(input.getAttribute('max')) || 100;
        var step = parseFloat(input.getAttribute('step')) || 1;
        var delta = max - min;

        // Calculate percentage
        var percent;
        var clientRect = input.getBoundingClientRect();
        var thumbWidth = (((100 / clientRect.width) * (settings.thumbWidth / 2)) / 100);

        // Determine left percentage
        percent = ((100 / clientRect.width) * (touch.clientX - clientRect.left));

        // Don't allow outside bounds
        if (percent < 0) {
            percent = 0;
        } else if (percent > 100) {
            percent = 100;
        }

        // Factor in the thumb offset
        if (percent < 50) {
            percent -= ((100 - (percent * 2)) * thumbWidth);
        } else if (percent > 50) {
            percent += (((percent - 50) * 2) * thumbWidth);
        }

        // Find the closest step to the mouse position
        return min + round(delta * (percent / 100), step);
    }

    // Update range value based on position
    function set(event) {
        // If not enabled, bail
        if (!settings.enabled || event.target.type !== 'range' || isDisabled(event.target)) {
            return;
        }

        // Prevent text highlight on iOS
        event.preventDefault();

        // Set value
        event.target.value = get(event);

        // Trigger input event
        trigger(event.target, (event.type === settings.events.end ? 'change' : 'input'));
    }

    // Run setup automatically
    setup();

    return {
        set: function(setting, value) {
            settings[setting] = value;
        }
    };
}));
