const notificationElement = document.getElementById('notification')
const notificationMessage = document.getElementById('notificationMessage')
const closeBtn = document.getElementById('notificationClose');


window.electronAPI.onNotify( (notification) => {
  notificationElement.style.transform = 'translateY(0)'
  notificationElement.classList.add(notification.status)
  notificationMessage.textContent = notification.message
})
