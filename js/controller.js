const queueElement = document.getElementById("queue");


window.electronAPI.onQueueUpdated( async (url) => {
    const li = document.createElement('li')
    const p = document.createElement('p')
    const span = document.createElement('span')
    const button = document.createElement('button')
    
    span.textContent = 'Loading...'
    p.appendChild(span)
    li.appendChild(p)

    button.textContent = 'x'
    li.appendChild(button)

    queueElement.appendChild(li)

    try {
      const response = await fetch(url)
      const html = await response.text()
      const match = html.match(/<title>(.*?)<\/title>/);

      if (match) {
        const title = match[1].replace(" - YouTube", "");

        span.textContent = title

      } else {
        p.textContent = 'unknow video'
      }
    } catch(error) {
      p.textContent = 'failed to load title'
    }
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



