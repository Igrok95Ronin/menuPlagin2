document.getElementById('reload').addEventListener('click', function () {
  chrome.tabs.reload(); 
  chrome.runtime.reload();  // Перезагрузка расширения
});
