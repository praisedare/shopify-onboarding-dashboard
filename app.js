/**
 * jQuery Emulator
 * @param {string} selector
 * @copyright Praise Dare 2023
 */
function $(selector) {
    return new jqWrapper(document.querySelectorAll(selector));
}

const jqWrapper = (() => {
    /**
     * @param {HTMLElement|HTMLElement[]} elements
     */
    function jqWrapper(elements) {
        const elems = Array.from(elements.length ? elements : [elements]);
        // console.log('elems', elems)
        for (let i = 0; i < elems.length; i++) {
            this[i] = elems[i];
        }
        this._elems = elems
    }

    /**
     * @type {HTMLElement[]}
     */
    jqWrapper.prototype._elems = [];

    jqWrapper.prototype.find = (selector) => new $(selector)
    /**
     * @param {string} eventType
     * @param {(e: Event) => void} callback
     */
    jqWrapper.prototype.on = function(eventType, callback) {
        for (let elem of this._elems)
            elem.addEventListener(eventType, callback.bind(elem));
    }
    /**
     * @param {(e: MouseEvent|KeyboardEvent) => void} callback
     */
    jqWrapper.prototype.onclick = function(callback) {
        this.on('click', callback);
    }
    /**
     * Returns true if the given element is a child of, or is the same as,
     * the given `potentialParent`
     * @param {HTMLElement} confusedKid
     * @param {HTMLElement|string} potentialParent The html element, or element selector to check for as a potential parent
     */
    jqWrapper.isChildOf = function(confusedKid, potentialParent) {
        if (confusedKid == potentialParent)
            return true;

        const isParent = parent => typeof potentialParent == 'string'
            ? parent.matches(potentialParent)
            : parent == potentialParent

        do {
            var parent = confusedKid.parentElement
            if (isParent(parent))
                return true;
            confusedKid = parent
        } while (parent);

        return false;
    }
    /**
     * @param {string} classNames A space delimited list of the classnames to toggle
     */
    jqWrapper.prototype.toggleClass = function(classNames) {
        let classNamesArr = classNames.split(' ')
        each(
            this,
            el => classNamesArr.forEach(className => el.classList.toggle(className))
        )
    }

    /**
     * @param {jqWrapper} jqElem
     * @param {(el: HTMLElement) => void} callback
     */
    const each = (jqElem, callback) => {
        for (let elem of jqElem._elems)
            callback(elem)
    }

    return jqWrapper
})();

const taskStateIcons = {
    incomplete: 'https://crushingit.tech/hackathon-assets/icon-dashed-circle.svg',
    loading: 'https://crushingit.tech/hackathon-assets/icon-spinner.svg',
    complete: 'https://crushingit.tech/hackathon-assets/icon-checkmark-circle.svg',
};

// Testing
// $('.setup-task').onclick(function(e) {
//     console.log('clicked on', this)
// });

/**
 * Prepends a `.` to a given classname
 * @param {string} className
 */
const c = className => `.${className}`;

(() => {
    const selector_taskItem = 'setup-task'
        , selector_taskOpen = 'setup-task--open'
        , selector_taskHeader = 'setup-task__header'
        , selector_tasksContainer = 'setup-guide__body'
        ;

    // Collapsible tasks
    $(c(selector_tasksContainer)).onclick(function(e) {
        if (
            !jqWrapper.isChildOf(e.target, c(selector_taskHeader))
            // If the setup-task clicked on is already opened, exit
        )
            return;

        /** @type {HTMLDivElement} */
        const $taskItem = e.target.closest(c(selector_taskItem))
        console.log('clicked on', $taskItem)
        if ($taskItem.classList.contains(selector_taskOpen))
            return;


        // Close theo ther open tasks
        $(c(selector_taskOpen)).toggleClass(selector_taskOpen)
        $taskItem.classList.toggle(selector_taskOpen)
    })
})();

