const notification = document.getElementById('notification')
const closeBtn = document.getElementById('notificationClose');

let isVisible = true;


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
