
const queueElement = document.getElementById("queue");

window.electronAPI.onQueueUpdated((queue) => {
  queueElement.innerHTML = "";

  queue.forEach((url, index) => {

   const li = `<li>
      <p><span>${url}</span></p>
      <button>x</button>
     </li>
    `

    queueElement.innerHTML += li;
  });
});
