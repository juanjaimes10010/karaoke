
const queueElement = document.getElementById("queue");


window.electronAPI.onQueueUpdated( (url) => {
    const li = document.createElement('li')
    const p = document.createElement('p')
    const span = document.createElement('span')
    const button = document.createElement('button')

    span.textContent = url
    p.appendChild(span)
    li.appendChild(p)

    button.textContent = 'x'
    li.appendChild(button)

    queueElement.appendChild(li)
})

const playlistSelectInput = document.getElementById('playlistSelect')

window.electronAPI.playlists.forEach( (playlist, i) => {
  const option = document.createElement('option')
  option.value = i
  option.textContent = playlist.title

  playlistSelectInput.appendChild(option)
})



playlistSelectInput.addEventListener('change', e => {
  const playlistIndex = playlistSelectInput.value
  
  queueElement.innerHTML = ''

  window.electronAPI.playlists[playlistIndex].songs.forEach( (song, i) => {
    const li = document.createElement('li')
    const p = document.createElement('p')
    const span = document.createElement('span')
    const button = document.createElement('button')

    span.textContent = song.title
    p.appendChild(span)
    li.appendChild(p)

    button.textContent = 'x'
    li.appendChild(button)

    queueElement.appendChild(li)
  })

})



