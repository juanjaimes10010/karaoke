const notification = document.getElementById('notification')
const closeBtn = document.getElementById('notificationClose');

let isVisible = true;

// this is just for testing how the notification will appear and disappear
document.addEventListener('click', () => {
  if(!isVisible) {
    notification.style.transform = 'translateY(0px)'
    isVisible = true
    return
  }
  if(isVisible) {
    notification.style.transform = 'translateY(-50px)'
    isVisible = false
    return
  }
})
