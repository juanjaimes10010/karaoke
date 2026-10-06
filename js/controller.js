let playlists
let currentPlaylist
let currentPlaylistIndex
let currentSongIndex

const queueElement = document.getElementById("queue")
const playlistSelectInput = document.getElementById('playlistSelect')

const drawPlaylists = () => {
  playlistSelectInput.innerHTML = ''
  playlists.forEach( (playlist, playlistIndex) => {
    const option = document.createElement('option')
    option.value = playlistIndex
    option.textContent = playlist.title

    playlistSelectInput.appendChild(option)
  })
}

const drawQueue = () => {
  queueElement.innerHTML = ''

  currentPlaylist.forEach( (song, songIndex) => {
    const li = document.createElement('li')
    const p = document.createElement('p')
    const span = document.createElement('span')
    const button = document.createElement('button')

    span.textContent = song.title
    p.appendChild(span)
    li.appendChild(p)

    button.textContent = 'x'
    button.setAttribute('data-song-index', songIndex)
    li.appendChild(button)

    if(currentSongIndex == songIndex) {
      li.classList.add('active')
    }

    queueElement.appendChild(li)
  })
}

const getPlaylists = () => window.electronAPI.playlists()

const updatePlaylist = (newPlaylist) => { window.electronAPI.updatePlaylist(newPlaylist) }

const setPlaylist = (playlist) => { currentPlaylist = playlist }

const startPlaylist = () => { 
  if(!currentSongIndex || !currentPlaylist) return;
  if(currentPlaylist[currentSongIndex])
    window.electronAPI.startSong(currentPlaylist[currentSongIndex].url)
}

const playSong = () => { window.electronAPI.playSong() }

const pauseSong = () => { window.electronAPI.pauseSong() }

const nextSong = () => { 
  if(!currentPlaylist || !currentSongIndex) return;

  currentSongIndex += 1

  if(currentSongIndex > currentPlaylist.length) currentSongIndex = 0
  
  if(currentPlaylist[currentSongIndex])
    window.electronAPI.startSong(currentPlaylist[currentSongIndex].url)

  drawQueue()
}

const previousSong = () => { 
  if(!currentPlaylist || !currentSongIndex) return;

  currentSongIndex -= 1

  if(currentSongIndex < 0) currentSongIndex = currentPlaylist.length - 1
  
  if(currentPlaylist[currentSongIndex])
    window.electronAPI.startSong(currentPlaylist[currentSongIndex].url)

  drawQueue()

}

const deleteSong = (songIndex) => {
  currentPlaylist.splice(songIndex, 1)

  if(songIndex == currentSongIndex) {
    nextSong()
  }


  window.electronAPI.updatePlaylists(playlists) 
}

const deletePlaylist = () => { 

  playlists.splice(currentPlaylistIndex)

  window.electronAPI.updatePlaylists(playlists)
}


playlists = getPlaylists();



window.electronAPI.onAddedSong( async (url) => {
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

        window.electronAPI.updatePlaylists(playlists[currentPlaylistIndex].songs.push({ title, url }))

      } else {
        p.textContent = 'unknow video'
        window.electronAPI.updatePlaylists(playlists[currentPlaylistIndex].songs.push({ title: 'Unknown Video', url }))
      }
    } catch(error) {
      p.textContent = 'failed to load title'
    }
})


playlistSelectInput.addEventListener('change', e => {
  if(playlistIndex == playlistSelectInput.value) return;

  playlistIndex = playlistSelectInput.value
  playlist = playlists[playlistIndex]
  
  drawQueue()
})

document.querySelectorAll('button[data-song-id]').forEach( btn => {
  const songIndex = btn.getAttribute('data-song-index')

  window.electronAPI.playlist[playlistIndex][songIndex]  
})


