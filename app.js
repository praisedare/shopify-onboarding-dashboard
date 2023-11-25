/**
 * jQuery Emulator
 * @param {string} selector
 * @copyright Praise Dare 2023
 */
function $(selector) {
    return new jqWrapper(
        typeof selector == 'string'
            ? document.querySelectorAll(selector)
            : selector
    );
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
        if (!classNames.length)
            return
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

const utils = {
    /**
     * Returns a promise that resolves after the given number of milliseconds
     * @param {number} ms
     */
    promiseTimeout(ms) {
        return new Promise(r => setTimeout(r, ms))
    }
}

// Testing
// $('.setup-task').onclick(function(e) {
//     console.log('clicked on', this)
// });

/**
 * Prepends a `.` to a given classname
 * @param {string} className
 */
const c = className => `.${className}`;

const selector_taskItem = 'setup-task'
    , selector_taskOpen = 'setup-task--open'
    , selector_taskHeader = 'setup-task__header'
    , selector_taskTitle = 'setup-task__title'
    , selector_tasksContainer = 'setup-guide__body'
    ;

/**
 * @typedef {object} TaskItem
 * @property {string} title 
 * @property {{btnType: string, text: string}[]} buttons
 * @property {string} description
 * @property {string} helpLink
 * @property {string} image
 * @property {boolean} isOpen
 */

const TaskItemProto = ({
    /**
     * Represents the completion state of the task item
     */
    complete: false,

    /**
     * Open the task item
     */
    _open() {
        this.classList.add(selector_taskOpen)
    },

    __proto__: HTMLDivElement.prototype,

    get selector_taskBtn() {
        return '_js-task-btn-state-toggle'
    },

    get selector_taskStateIcon() {
        return '_js-task-state-icon'
    },

    /**
     * The image used to represent the completion state of the task
     * @type {HTMLImageElement}
     */
    get elem_taskStateIcon() {
        return this.querySelector(c(this.selector_taskStateIcon))
    },

    /**
     * The button containing the task's state icon
     * @type {HTMLButtonElement}
     */
    get elem_taskBtn() {
        return this.querySelector(c(this.selector_taskBtn));
    },

    get taskStateIcons() {
        return {
            incomplete: {
                src: 'https://crushingit.tech/hackathon-assets/icon-dashed-circle.svg',
                className: 'filter-color-medium-gray',
            },
            loading: {
                src: 'https://crushingit.tech/hackathon-assets/icon-spinner.svg',
                className: 'filter-color-medium-gray animation__spin',
            },
            complete: {
                src: 'https://crushingit.tech/hackathon-assets/icon-checkmark-circle.svg',
                className: '',
            }
        };
    },
    /**
     * The CSS class that styles an
     */
    get taskStateIconImcompleteClass() {
        return ''
    }
});

/**
 * @param {TaskItem} details
 */
const createTaskItem = details => {
    /** @type {HTMLDivElement & TaskItemProto} */
    const $taskItem = (new DOMParser).parseFromString(`
        <div class="setup-task">
            <div class="setup-task__left-panel">
                <div class="setup-task__header">
                    <div class="setup-task__status-icon-wrapper">
                        <button class="btn p-0 m-0 _js-task-btn-state-toggle">
                            <img class="setup-task__status-icon ${TaskItemProto.taskStateIcons.incomplete.className} _js-task-state-icon" src="https://crushingit.tech/hackathon-assets/icon-dashed-circle.svg" alt="">
                        </button>
                    </div>
                    <button class="btn setup-task__title"><h3>${details.title}</h3></button>
                </div>
                <div class="setup-task__details">
                    <div class="setup-task__details-wrapper">
                        <p class=setup-task__description>${details.description} <a href="${details.helpLink}">Learn more</a></p>
                        <div style="display: flex; gap: 0.75rem;">
                            ${
                                details.buttons.map(button => (
                                    `<button class="btn ${button.btnType}">${button.text}</button>`
                                )).join('')
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div class="setup-task__right-panel">
                <div class="setup-task__image">
                    <img src="${details.image}" alt="" aria-hidden="true">
                </div>
            </div>
        </div>
    `, 'text/html')
        .documentElement
        .lastChild
        .firstElementChild;

    Object.setPrototypeOf($taskItem, TaskItemProto)

    { // Bootstrapping of taskItem component
        if (details.isOpen)
            $taskItem._open();
        $taskItem.elem_taskBtn.onclick = async function() {
            if (this.__stateChanging)
                return

            this.__stateChanging = true

            {
                const initialStateIcon = $taskItem.taskStateIcons[
                    $taskItem.complete
                        ? 'complete'
                        : 'incomplete'
                ]

                $taskItem.complete = !$taskItem.complete

                const currentStateIcon = $taskItem.taskStateIcons[
                    $taskItem.complete
                        ? 'complete'
                        : 'incomplete'
                ];

                const $stateIcon = $($taskItem.elem_taskStateIcon)

                // loading
                $stateIcon.toggleClass(initialStateIcon.className)
                $stateIcon.toggleClass($taskItem.taskStateIcons.loading.className)
                $taskItem.elem_taskStateIcon.src = $taskItem.taskStateIcons.loading.src
                await utils.promiseTimeout(1.5e3)

                // complete/uncomplete
                $stateIcon.toggleClass($taskItem.taskStateIcons.loading.className)
                $stateIcon.toggleClass(currentStateIcon.className)
                $taskItem.elem_taskStateIcon.src = currentStateIcon.src
                // await utils.promiseTimeout(250)
            }

            this.__stateChanging = false
        }
    }

    return $taskItem;
}

{ // Setup Tasks
    // Collapsible tasks
    $(c(selector_tasksContainer)).onclick(function(e) {
        if (
            !jqWrapper.isChildOf(e.target, c(selector_taskTitle))
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
}

{ // Alerts
    $('.alert .alert__close').onclick(function() {
        this.closest('.alert').style.display = 'none';
    })
}

{ // Populate task items
    /** @type {TaskItem[]} */
    const taskItems = [
        {
            title: 'Customize your online store',
            description: 'Choose a theme and add your logo, colors, and images to reflect your brand.',
            helpLink: 'https://help.shopify.com/manual/online-store/themes/customizing-themes',
            buttons: [
                {
                    text: 'Customize theme',
                    btnType: 'btn-dark',
                }
            ],
            image: 'https://crushingit.tech/hackathon-assets/customise-store.png',
            isOpen: true,
        },
        {
            title: 'Add your first product',
            description: 'Write a description, add photos, and set pricing for the products you plan to sell.',
            helpLink: 'https://help.shopify.com/manual/products/add-update-products',
            buttons: [
                {
                    text: 'Add product',
                    btnType: 'btn-dark',
                },
                {
                    text: 'Import products',
                    btnType: 'btn-transparent',
                }
            ],
            image: 'https://crushingit.tech/hackathon-assets/product.png',
        },
        {
            title: 'Add a custom domain',
            description: 'Your current domain is 222219.myshopify.com but you can add a custom domain to help customers find your online store.',
            helpLink: 'https://help.shopify.com/manual/domains',
            buttons: [
                {
                    text: 'Add domain',
                    btnType: 'btn-dark',
                },
            ],
            image: 'https://crushingit.tech/hackathon-assets/website.png',
        },
        {
            title: 'Name your store',
            description: 'Your temporary store name is currently Davii collections. The store name appears in your admin and your online store.',
            helpLink: 'https://help.shopify.com/manual/intro-to-shopify/initial-setup/setup-business-settings#set-or-change-your-online-store-name-and-legal-business-name',
            buttons: [
                {
                    text: 'Name store',
                    btnType: 'btn-dark',
                },
            ],
            image: 'https://crushingit.tech/hackathon-assets/name-store.png',
        },
    ]

    const $tasksContainer = $('.setup-guide__body')[0]
    taskItems.forEach(taskItem => {
        $tasksContainer.append(createTaskItem(taskItem))
    })
}


