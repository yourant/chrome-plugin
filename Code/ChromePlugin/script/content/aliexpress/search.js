// 监听有关background,popups的信息
// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
let requestParams = {}
chrome.extension.onMessage.addListener(function(request, _, response) {
  switch (request.code) {
    case 'search': {
      requestParams = request
    }
      break
    default: {
    }
  }
})
document.addEventListener(
  'DOMContentLoaded',
  function() {
    detailFn.init()
  },
  false
)
const detailFn = {
  init() {
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      let panel = $('.spider-append-icon')
      panel.removeClass('spider-color-forbidden')
      panel.attr('title', '跳转到详情页面')
      panel.innerText = ''
      panel.innerText = '跳转详情'
      panel.unbind('click').on('click', function() {
        $('#sfc-collect-mask').attr('style', 'display:block')
      })
    } else {
      this.init()
    }
  }
}