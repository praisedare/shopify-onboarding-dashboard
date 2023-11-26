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
        const elems = Array.from('length' in elements ? elements : [elements]);
        // console.log('elems', elems)
        for (let i = 0; i < elems.length; i++) {
            this[i] = elems[i];
        }
        this._elems = elems
        this.length = elems.length
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
    jqWrapper.prototype.on = function(eventType, callback, options = {}) {
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

        if (!confusedKid)
            return false
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
        this.each(
            el => classNamesArr.forEach(className => el.classList.toggle(className))
        )
    }

    /**
     * @param {(el: HTMLElement) => void} callback
     */
    jqWrapper.prototype.each = function(callback) {
        for (let elem of this._elems)
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
const c2 = (joinWith = '', ...classNames) => (
    classNames.map(c).join(joinWith)
)

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
    __proto__: HTMLDivElement.prototype,

    isOpen: false,
    /**
     * Represents the completion state of the task item
     */
    __complete: false,

    get complete() {
        return this.__complete
    },
    /**
     * @param {boolean} complete
     */
    set complete(complete) {
        this.__complete = complete;
        [...this.__completeListeners].forEach(f => f(complete))
    },

    /**
     * @type {Set<Function>}
     */
    __completeListeners: new Set,
    /**
     * @param {(completed: boolean) => void} hook
     */
    addCompleteHook(hook) {
        this.__completeListeners.add(hook)
    },
    removeCompleteHook(hook) {
        this.__completeListeners.remove(hook)
    },

    /**
     * Open the task item
     */
    _collapseToggle() {
        this.isOpen = !this.isOpen;
        this.classList.toggle(selector_taskOpen);
    },

    get selector_taskBtn() {
        return '_js-task-btn-state-toggle'
    },

    get selector_taskStateIcon() {
        return '_js-task-state-icon'
    },

    get selector__taskTitleBtn() {
        return 'setup-task__title'
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

    /**
     * The button containing the task title
     * @type {HTMLButtonElement}
     */
    get elem_taskTitleBtn() {
        return this.querySelector(c(this.selector__taskTitleBtn))
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
                        <button class="btn p-0 m-0 _js-task-btn-state-toggle" style="height: 100%;">
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
        $taskItem.__completeListeners = new Set
        if (details.isOpen)
            $taskItem._collapseToggle();

        // Switch task completion state
        $taskItem.elem_taskBtn.onclick = async function() {
            if (this.__stateChanging)
                return

            this.__stateChanging = true

            {
                const newCompletionState = !$taskItem.complete

                const initialStateIcon = $taskItem.taskStateIcons[
                    $taskItem.complete
                        ? 'complete'
                        : 'incomplete'
                ]

                const currentStateIcon = $taskItem.taskStateIcons[
                    newCompletionState
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

                // and finally change completion state
                $taskItem.complete = newCompletionState
            }

            this.__stateChanging = false
        }

        // Collapse
        $taskItem.elem_taskTitleBtn.onclick = () => {
            if ($taskItem.isOpen)
                return
            // close the other open task
            $(c(selector_taskOpen)).each(el => el._collapseToggle())
            // open this one
            $taskItem._collapseToggle()
        }
    }

    return $taskItem;
}

{ // Setup Tasks
    // Preload all the task state icons for smoother animations
    Object.values(TaskItemProto.taskStateIcons).forEach(i => {
        let img = new Image
        img.src = i.src
        img.style = 'position: fixed; width: 1px;'
        document.body.append(img)
    })

    // Populate task items
    /** @type {TaskItem[]} */
    const taskItemsDefinitions = [
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
        {
            title: 'Setup a payment provider',
            description: 'Choose a payment provider to start accepting payments. You’ll need to create an account with the payment provider and set it up with your Shopify store.',
            helpLink: 'https://help.shopify.com/en/manual/payments',
            buttons: [
                {
                    text: 'Setup payment',
                    btnType: 'btn-dark',
                },
            ],
            image: 'https://crushingit.tech/hackathon-assets/payment.png',
        },
    ]

    const $tasksContainer = $('.setup-guide__body')[0]

    let completedTasksCount = 0

    taskItemsDefinitions.forEach(taskItemDfn => {
        const taskItem = createTaskItem(taskItemDfn)
        $tasksContainer.append(taskItem)
        taskItem.addCompleteHook(setCompletedTasksCount)
    })

    function updateCompletionProgressBar() {
        $('._js-tasks-complete-count')[0].innerText = completedTasksCount
        $('.progress-bar-slider')[0].style.width = `${completedTasksCount / taskItemsDefinitions.length * 100}%`
    }
    /**
     * @param {boolean} c
     */
    function setCompletedTasksCount(c) {
        if (c)
            completedTasksCount++
        else
            completedTasksCount--
        updateCompletionProgressBar()
    }
}

{ // Collapse toggle for setup-guide__body
    $('.setup-guide__collapse-btn').onclick(async function() {
        /** @type {HTMLButtonElement} */
        let btn = this
            , icon = btn.querySelector('img')
            , body = $('.setup-guide__body')._elems[0]
        ;

        body.classList.toggle('setup-guide__body--open')

        let openState = +btn.dataset.opened
        icon.style.transform = openState
            ? 'rotate(180deg)'
            : 'rotate(0deg)'
        btn.dataset.opened = +!openState
    });
}

{ // Alerts
    $('.alert .alert__close').onclick(function() {
        this.closest('.alert').style.display = 'none';
    })
}

{ // Popup Menus
    const menuClass = 'popup-menu'
        , menuOpenClass = 'popup-menu--open'
        , fullMenuOpenClass = `${menuOpenClass} animation__fadeInUp`
        , menuCloseClass = `animation__fadeOutDown`
    ;

    const PopupMenuProto = ({
        __proto__: HTMLDivElement.prototype,
        _isOpen: false,
        /** Constructor function */
        _initialize() {
            // this.addEventlistener('focusl
            /** @type {PopupMenu} */
            const menu = this
        },
        toggle() {
            if (this._isOpen)
                this.close()
            else
                this.open()
        },
        open() {
            if (this._isOpen)
                return;
            this._isOpen = true;
            this.classList.remove(menuCloseClass)
            this.classList.add(...fullMenuOpenClass.split(' '))

            const closeIfNotChild = el => !jqWrapper.isChildOf(el, this) && this.close()
            this._clickWatcher = (e) => closeIfNotChild(e.target)
            this._focusWatcher = (e) => closeIfNotChild(e.relatedTarget) && console.log('focus watcher running')

            setTimeout(() => {
                window.addEventListener('focusout', this._focusWatcher, {capture: true})
                window.addEventListener('click', this._clickWatcher)
            })
        },
        close() {
            if (!this._isOpen)
                return;
            this._isOpen = false;

            this.classList.remove(...fullMenuOpenClass.split(' '))
            this.classList.add(menuCloseClass)

            window.removeEventListener('focusout', this._focusWatcher)
            window.removeEventListener('click', this._clickWatcher)
        },
    });

    /**
     * @typedef {typeof HTMLDivElement.prototype & typeof PopupMenuProto} PopupMenu
     */

    $(c(menuClass)).each(e => {
        Object.setPrototypeOf(e, PopupMenuProto)
        /** @type {PopupMenu} */
        const menu = e
        menu._initialize();
    })

    /**
     * GEt the popup menu for a popup-menu trigger
     */
    const getPopupMenu = trigger => {
        /** @type {PopupMenu} */
        const popupMenu = $(trigger.dataset.popupMenu)._elems[0];
        return popupMenu
    }

    const $popupMenuTriggers = $('[data-popup-menu]');
    $popupMenuTriggers.onclick(function() {
        /** @type {PopupMenu} */
        const popupMenu = getPopupMenu(this);
        // Close other menus
        $(c(menuOpenClass)).each(el => {
            if (el == popupMenu)
                return
            /** @type {PopupMenu} */
            const menu = el
            menu.close()
        });
        popupMenu.toggle();
    });
    // $popupMenuTriggers.on('blur', function(e) {
    //     /** @type {PopupMenu} */
    //     const popupMenu = getPopupMenu(this);
    //     if (!jqWrapper.isChildOf(e.relatedTarget, popupMenu))
    //         popupMenu.close();
    // })
}

{ // Store menu
    /**
     * @typedef {object} StoreMenuItem
     * @property {string|null} name An optional name (text) for the menu item.
     * @property {string|null} content If no name is provided, then manually provide the content with this property
     * @property {string|null} className Optional classnames to add to the dropdown-menu-item
     * @property {boolean} focusable Should the item be focusable with keyboard? Choosing no will also disable the link
     */

    /**
     * @typedef {StoreMenuItem[]} StoreMenuGroup
     */

    /**
     * @type {StoreMenuGroup[]}
     */
    const menuItems = [
        [
            {
                content: `
                    <div class="relative">
                        <button class="header__shop-badge btn justify-start" style="flex-direction: row-reverse; width: 100%;" tabindex="-1">
                            <span class="header__shop-name">Davii Collections</span>
                            <span class="header__shop-icon flex flex-center">DC</span>
                        </button>
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg"
                            style="position: absolute; right: 1em; top: 50%; transform: translateY(-50%);">
                            <path d="M11.3332 1L3.99984 8.33333L0.666504 5" stroke="#303030" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                `,
                focusable: false,
                className: 'p-0 m-0',
            },
            {
                content: `
                    <div class="flex gap-2">
                        <svg width="20" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.757 3H7.24302C6.85944 3 6.4971 3.17611 6.26012 3.47772L3.87394 6.51468C3.63169 6.823 3.5 7.20375 3.5 7.59586V8.25C3.5 9.31867 4.10958 10.245 5 10.7001V15.25C5 16.2165 5.7835 17 6.75 17H14.25C15.2165 17 16 16.2165 16 15.25V10.7001C16.8904 10.245 17.5 9.31867 17.5 8.25V7.76879C17.5 7.26465 17.3307 6.77511 17.0192 6.3787L14.7399 3.47772C14.5029 3.17611 14.1406 3 13.757 3ZM13.5 15.5H14.25C14.3881 15.5 14.5 15.3881 14.5 15.25V11C13.712 11 13.0014 10.6686 12.5 10.1375C11.9986 10.6686 11.288 11 10.5 11C9.71199 11 9.00138 10.6686 8.5 10.1375C7.99862 10.6686 7.28801 11 6.5 11V15.25C6.5 15.3881 6.61193 15.5 6.75 15.5H10.5V13C10.5 12.4477 10.9477 12 11.5 12H12.5C13.0523 12 13.5 12.4477 13.5 13V15.5ZM6.5 9.5H6.25C5.55964 9.5 5 8.94036 5 8.25V7.59586C5 7.53985 5.01881 7.48545 5.05342 7.44141L7.36453 4.5H13.6355L15.8397 7.30543C15.9436 7.43757 16 7.60075 16 7.76879V8.25C16 8.94036 15.4404 9.5 14.75 9.5H14.5C13.8096 9.5 13.25 8.94036 13.25 8.25V7.75C13.25 7.33579 12.9142 7 12.5 7C12.0858 7 11.75 7.33579 11.75 7.75V8.25C11.75 8.94036 11.1904 9.5 10.5 9.5C9.80964 9.5 9.25 8.94036 9.25 8.25V7.75C9.25 7.33579 8.91421 7 8.5 7C8.08579 7 7.75 7.33579 7.75 7.75V8.25C7.75 8.94036 7.19036 9.5 6.5 9.5Z" style="fill: var(--gray-300)" />
                        </svg>
                        <span>All Stores</span>
                    </div>
                `
            },
        ],
        [
            ...['Help Center', 'Changelog', 'Community forums', 'Hire a Shopify Partner', 'Keyboard Shortcuts']
                .map(name => ({name}))
        ],
        [
            {
                content: `
                    <p class="p-0 m-0 text-gray-300" style="font-weight: 500;">David Micheal</p>
                    <p class="p-0 m-0 text-secondary">davidmicheal@gmail.com</p>
                `,
                focusable: false,
            },
            {name: 'Manage Account'},
            {name: 'Logout'},
        ]
    ];

    $('.store-menu')._elems[0].innerHTML = menuItems.map(itemGroup => {
        const content = itemGroup.map(item => {
            const focusable = ![null, false].includes(item.focusable);
            return `
                <a
                    class="dropdown-menu-item ${item.className ?? ''}"
                    href="${focusable ? "https://admin.shopify.com" : 'javascript://' }"
                    ${!focusable ? 'tabindex="-1"' : ''}
                >
                    ${ item.name ?? item.content }
                </a>
            `
        }).join('')
        return `<li class="store-menu__menu-section"><ul class="p-0 m-0 flex gap-1 flex-column">${content}</ul></li>`
    }).join('')
}

