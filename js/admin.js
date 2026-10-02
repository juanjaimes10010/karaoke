const viewSplitter = document.getElementById('viewSplitter')

let dragging = false
let newPos = 0

viewSplitter.addEventListener('mousedown', (event) => {
  dragging = true
  document.body.style.cursor = 'grabbing'
})

document.addEventListener('mousemove', (event) => {
  if (dragging) {
    newPos = event.clientX
    if(newPos < 150) newPos = 150
    else if(newPos > window.innerWidth - 150) newPos = window.innerWidth - 150

    viewSplitter.style.left = `${newPos}px`

    window.electronAPI.setViewBounds(newPos)
  }
})

document.addEventListener('mouseup', (event) => {
  dragging = false
  document.body.style.cursor = 'default'
})

