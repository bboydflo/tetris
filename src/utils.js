export function createFragment(htmlStr) {
    const frag = document.createDocumentFragment()
    const temp = document.createElement('div')
    temp.innerHTML = htmlStr
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild)
    }
    return frag
}
