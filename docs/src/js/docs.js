// ==========================================================================
// Docs example
// ==========================================================================

import RangeTouch from '../../../src/js/rangetouch';

document.addEventListener('DOMContentLoaded', () => {
    const loadSprite = url => {
        const xhr = new XMLHttpRequest();
        const { body } = document;

        // Check for CORS support
        // If you're loading from same domain, you can remove the whole if/else statement
        // XHR for Chrome/Firefox/Opera/Safari/IE10+
        if (!('withCredentials' in xhr)) {
            return;
        }

        xhr.open('GET', url, true);

        // Inject hidden div with sprite on load
        xhr.onload = () => {
            const container = document.createElement('div');
            container.setAttribute('hidden', '');
            container.innerHTML = xhr.responseText;
            body.insertBefore(container, body.childNodes[0]);
        };

        xhr.send();
    };

    ['dist/docs.svg'].forEach(loadSprite);

    // Setup shr
    window.shr.setup({
        count: {
            classname: 'btn__count',
        },
    });

    // Set range thumb size
    RangeTouch.setup('.js-example', { thumbWidth: 20 });

    // Test MutationObserver
    /* setTimeout(() => {
        const input = document.createElement('input');
        input.type = 'range';
        input.className = 'js-example';
        document.getElementById('test').appendChild(input);
    }, 2000); */
});
