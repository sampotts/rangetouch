// ==========================================================================
// rangetouch.js v2.0.0
// Making <input type="range"> work on touch devices
// https://github.com/sampotts/rangetouch
// License: The MIT License (MIT)
// ==========================================================================

import { addCSS, matches } from './css';
import trigger from './events';
import { round } from './numbers';

class RangeTouch {
    constructor(selector = '[type="range"]', options = {}) {
        this.selector = selector;
        this.elements = document.querySelectorAll(selector);
        this.config = Object.assign(
            {
                addCSS: true,
                thumbWidth: 15,
                watch: true,
            },
            options,
        );

        this.setup();
    }

    setup() {
        // Bail if not a touch enabled device
        if (!('ontouchstart' in document.documentElement)) {
            return;
        }

        // Add useful CSS
        if (this.config.addCSS) {
            addCSS(
                this.selector,
                'user-select: none; -webkit-user-select: none; touch-action: manipulation',
            );
        }

        // Listen for events
        const events = ['touchstart', 'touchmove', 'touchend'];

        events.forEach(type => {
            document.body.addEventListener(
                type,
                event => {
                    if (!matches(event.target, this.selector)) {
                        return;
                    }
                    this.set(event);
                },
                false,
            );
        });
    }

    // Get the value based on touch position
    get(event) {
        const input = event.target;
        const touch = event.changedTouches[0];
        const min = parseFloat(input.getAttribute('min')) || 0;
        const max = parseFloat(input.getAttribute('max')) || 100;
        const step = parseFloat(input.getAttribute('step')) || 1;
        const delta = max - min;

        // Calculate percentage
        let percent;
        const clientRect = input.getBoundingClientRect();
        const thumbWidth =
            ((100 / clientRect.width) * (this.config.thumbWidth / 2)) / 100;

        // Determine left percentage
        percent = (100 / clientRect.width) * (touch.clientX - clientRect.left);

        // Don't allow outside bounds
        if (percent < 0) {
            percent = 0;
        } else if (percent > 100) {
            percent = 100;
        }

        // Factor in the thumb offset
        if (percent < 50) {
            percent -= (100 - percent * 2) * thumbWidth;
        } else if (percent > 50) {
            percent += (percent - 50) * 2 * thumbWidth;
        }

        // Find the closest step to the mouse position
        return min + round(delta * (percent / 100), step);
    }

    // Update range value based on position
    set(event) {
        if (event.target.disabled) {
            return;
        }

        // Prevent text highlight on iOS
        event.preventDefault();

        // Set value
        event.target.value = this.get(event);

        // Trigger event
        trigger(event.target, event.type === 'touchend' ? 'change' : 'input');
    }
}

export default RangeTouch;
