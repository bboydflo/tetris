export function createFragment(htmlStr) {
    const frag = document.createDocumentFragment()
    const temp = document.createElement('div')
    temp.innerHTML = htmlStr
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild)
    }
    return frag
}

export function delegate(eventName, elementSelector, handler) {
    document.addEventListener(eventName, function(e) {
        // loop parent nodes from the target to the delegation node
        for (let target = e.target; target && target != this; target = target.parentNode) {
            if (target.matches(elementSelector)) {
                handler.call(target, e);
                break;
            }
        }
    }, false);
}
