// ==========================================================================
// Docs example
// ==========================================================================

/*global shr*/

(function() {
    'use strict';

    function loadSprite(url) {
        var xhr = new XMLHttpRequest(),
            body = document.body;

        // Check for CORS support
        // If you're loading from same domain, you can remove the whole if/else statement
        // XHR for Chrome/Firefox/Opera/Safari/IE10+
        if ('withCredentials' in xhr) {
            xhr.open('GET', url, true);
        }
        // XDomainRequest for IE8 & IE9
        else if (typeof XDomainRequest == 'function') {
            xhr = new XDomainRequest();
            xhr.open('GET', url);
        }
        else { return; }

        // Inject hidden div with sprite on load
        xhr.onload = function() {
            var container = document.createElement('div');
            container.setAttribute('hidden', '');
            container.innerHTML = xhr.responseText;
            body.insertBefore(container, body.childNodes[0]);
        };

        // Timeout for IE9
		setTimeout(function () {
			xhr.send();
		}, 0);
    }
    
    ['dist/docs.svg'].forEach(loadSprite);

    // Setup shr
	shr.setup({
		count: {
			classname: 'btn__count'
		}
	});
})();


