'use strict'
const $ = document.querySelector.bind(document)
    , $$ = document.querySelectorAll.bind(document)
    , dropbox = $('.js-drag')
    , uploads = $('.uploads')

let processingTimeout, loadingTimeout

const strings = {
    onDrag: "Drag it here!",
    onDragOver: "Now, drop it!",
    onDrop: "Yay! Thanks!",
    onStable: "Drag and drop an image here",
    onFileTypeError: "Oops! That's not an image",
    onEmptyFilesError: "Wait, did you drop something? Didn't see anything."
}

dropbox.addEventListener('dragenter', onDragEnterHandler, false)
dropbox.addEventListener('dragleave', onDragLeaveHandler, false)
dropbox.addEventListener('dragover', onDragOverHandler, false)
dropbox.addEventListener('drop', onDropHandler, false)

function onDragEnterHandler(e) {
    e.stopPropagation()
    e.preventDefault()
}

function onDragLeaveHandler(e) {
    e.stopPropagation()
    e.preventDefault()

    this.setAttribute('aria-label', strings.onStable)
    this.classList.remove('drag-enter')
}

function onDragOverHandler(e) {
    e.stopPropagation()
    e.preventDefault()

    this.setAttribute('aria-label', strings.onDragOver)
    this.classList.add('drag-enter')
}

function onDropHandler(e) {
    e.stopPropagation()
    e.preventDefault()
    this.classList.remove('drag-enter')
    this.classList.add('dropped')
    this.setAttribute('aria-label', strings.onDrop)

    const dt = e.dataTransfer
    const files = dt.files


    const that = this
    processingTimeout = setTimeout(() => {
        that.classList.remove('dropped')
        that.classList.add('processing')

        loadingTimeOut = setTimeout(() => {
            that.classList.add('loading')
            handleFiles(files)
        }, 700)
    }, 1000)
}

function handleFiles(files) {
    if (files.length < 1) {
        finishProcessing()
        raiseEmptyFilesError()
    }

    for (let i = 0; i < files.length; i++) {
        let file = files[i]

        if (!file.type.startsWith('image/')) {
            finishProcessing()
            raiseFileTypeError()
            return
        }

        addThumbnail(file)
        revertDefaultDropboxState()
    }
}

function addThumbnail(file) {
    const img = document.createElement('img')
    img.classList.add('thumbnail')
    img.file = file
    uploads.appendChild(img)

    const reader = new FileReader();
    reader.onload = (function (aImg) {
        return function (e) {
            aImg.src = e.target.result
        }
    })(img)

    reader.readAsDataURL(file)
}

function finishProcessing() {
    if (processingTimeout !== null) clearTimeout(processingTimeout)
    if (loadingTimeout != null) clearTimeout(loadingTimeout)

    dropbox.classList.remove('processing')
    dropbox.classList.remove('loading')
}

function raiseFileTypeError() {
    dropbox.classList.add('error')
    dropbox.setAttribute('aria-label', strings.onFileTypeError)

    setTimeout(revertDefaultDropboxState, 2000)
}

function revertDefaultDropboxState() {
    dropbox.setAttribute('class', '')
    dropbox.classList.add('js-drag', 'drag-file-upload')
    dropbox.setAttribute('aria-label', strings.onStable)
}

function raiseEmptyFilesError() {
    dropbox.classList.add('warning')
    dropbox.setAttribute('aria-label', strings.onEmptyFilesError)

    setTimeout(revertDefaultDropboxState, 2000)
}