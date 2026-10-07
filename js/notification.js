const notificationElement = document.getElementById('notification');
const notificationMessage = document.getElementById('notificationMessage');
const closeBtn = document.getElementById('notificationClose');

let notificationTimeout;
const notificationQueue = [];
let isProcessing = false;


window.electronAPI.onNotify((notification) => {
  notificationQueue.push(notification);
  processQueue();
});

function processQueue() {
  if (isProcessing || notificationQueue.length === 0) return;
  
  isProcessing = true;
  const currentNotification = notificationQueue.shift();

  notificationMessage.textContent = currentNotification.message;
  notificationElement.classList.add(currentNotification.status);
  notificationElement.style.transform = 'translateY(0)';

  const onSlideInComplete = (event) => {
    if (event.propertyName === 'transform') {
      notificationElement.removeEventListener('transitionend', onSlideInComplete);
      
      notificationTimeout = setTimeout(hideNotification, notificationQueue.length ? 1000: 3000);
    }
  };

  notificationElement.addEventListener('transitionend', onSlideInComplete);
}

function hideNotification() {
  clearTimeout(notificationTimeout);
  notificationElement.style.transform = 'translateY(-100%)';

  const onSlideOutComplete = (event) => {
    if (event.propertyName === 'transform') {
      notificationElement.removeEventListener('transitionend', onSlideOutComplete);
      
      notificationElement.classList.remove('success', 'error');
      
      isProcessing = false;
      processQueue();
    }
  };
  notificationElement.addEventListener('transitionend', onSlideOutComplete);
}

closeBtn.addEventListener('click', hideNotification);
