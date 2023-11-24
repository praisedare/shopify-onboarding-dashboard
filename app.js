/**
 * @param {string} selector
 */
function $(selector) {
    return new jqWrapper(document.querySelector(selector));
}

/**
 * @param {HTMLElement|HTMLElement[]} elements
 */
function jqWrapper(elements) {
    const elems = (Array.isArray(elements) ? elements : [elements]);
    // console.log('elems', elems)
    for (let i = 0; i < elems.length; i++) {
        this[i] = elems[i];
    }
}

jqWrapper.prototype.find = (selector) => new $(selector)

