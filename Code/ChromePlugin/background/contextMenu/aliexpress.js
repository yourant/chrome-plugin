/* 监听ebay广告列表返回的数据 */
let aliexpress = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'aliexpress_search_id': {
      console.log(request)
      aliexpress = request
      chrome.contextMenus.update(aliexpressParent, {
        title: `在aliexpress中搜索此产品：${aliexpress.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const aliexpressUrlPatterns = ['http://dev.istore2.com/aliexpress/product/index', 'http://dev.istore2.com/aliexpress/product*', "http://istore.szecommerce.com/aliexpress/product*", "http://istore.szecommerce.com/aliexpress/product/index"]
const aliexpressParent = chrome.contextMenus.create({
  title: `在aliexpress中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: aliexpressUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update(aliexpressParent, {
    title: `在aliexpress中搜索此产品：${aliexpress.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  chrome.tabs.create(
    { url: `https://www.aliexpress.com/wholesale?SearchText=${encodeURI(aliexpress.title)}&from_id=${aliexpress.id}` })
  // setTimeout(() => {
  //
  // }, 5000)
}
