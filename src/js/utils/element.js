export function isElementRTL(element) {
    if (!element) return false;
    return document.dir === 'rtl' || element.dir === 'rtl' || window.getComputedStyle(element).direction === 'rtl';
}

export default { isElementRTL };
