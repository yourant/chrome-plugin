/* 监听yahoo广告列表返回的数据 */
let yahooData = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'yahoo_search_id': {
      console.log(request)
      yahooData = request
      chrome.contextMenus.update(yahooParent, {
        title: `在yahoo ${yahooData.site}中搜索此产品：${yahooData.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const yahooSite = {
    'Yahoo.co.jp':	'Yahoo.co.jp',
    'Yahoo.co.jp3':	'Yahoo.co.jp3'
}
const yahooUrlPatterns = ['http://istore.szecommerce.com/yahoo/product', 'http://istore.szecommerce.com/yahoo/product/index']
const yahooParent = chrome.contextMenus.create({
  title: `在yahoo中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: yahooUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update(yahooParent, {
    title: `在yahoo ${yahooData.site}中搜索此产品：${yahooData.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  // 注意不能使用location.href，因为location是属于background的window对象

  chrome.tabs.create({ url: `https://shopping.yahoo.co.jp/search?p=${encodeURI(yahooData.title)}&from_id=${yahooData.id}` }
  )
  // setTimeout(() => {
  //
    // }, 5000)
}
