chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.code === 'create-tab') {
    createTab(request)
  }
})

function createTab(request) {
  chrome.tabs.create({ url: request.url })
}