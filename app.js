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

const taskStateIcons = {
    incomplete: 'https://crushingit.tech/hackathon-assets/icon-dashed-circle.svg',
    loading: 'https://crushingit.tech/hackathon-assets/icon-spinner.svg',
    complete: 'https://crushingit.tech/hackathon-assets/icon-checkmark-circle.svg',
}

