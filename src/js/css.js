// Inject CSS to the page
export function addCSS(selector, css) {
    const id = 'rangetouch';
    const existing = document.getElementById(id);
    let sheet;

    if (existing && existing.nodeName.toLowerCase() === 'style') {
        ({ sheet } = existing);
    } else {
        const style = document.createElement('style');
        style.id = id;
        style.appendChild(document.createTextNode(''));
        document.head.appendChild(style);
        ({ sheet } = style);
    }

    sheet.insertRule(`${selector} { ${css} }`, 0);
}

// Element matches a selector
export function matches(element, selector) {
    const prototype = { Element };

    function match() {
        return Array.from(document.querySelectorAll(selector)).includes(this);
    }

    const matches =
        prototype.matches ||
        prototype.webkitMatchesSelector ||
        prototype.mozMatchesSelector ||
        prototype.msMatchesSelector ||
        match;

    return matches.call(element, selector);
}
