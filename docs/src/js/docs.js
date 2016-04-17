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
    
    window.loadSprites = function(sprites) {
        sprites.forEach(loadSprite);
    };   

    // Setup shr
	shr.setup({
		count: {
			classname: 'btn__count'
		}
	});

    // Set range thumb size
    window.rangetouch.set('thumbWidth', 20);

    // Google analytics
    // For demo site (https://rangetouch.com) only
    if(document.domain.indexOf('rangetouch.com') > -1) {
        (function(i,s,o,g,r,a,m){i.GoogleAnalyticsObject=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', 'UA-40881672-15', 'auto');
        ga('send', 'pageview');
    }
})();