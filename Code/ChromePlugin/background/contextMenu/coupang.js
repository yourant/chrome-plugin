/* 监听ebay广告列表返回的数据 */
let  coupang = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'coupang_search_id': {
       coupang = request
      chrome.contextMenus.update(coupangParent, {
        title: `在 coupang 中搜索此产品：${coupang.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const  coupangUrlPatterns = ['http://ad.szecommerce.com/coupang/advertising']
const  coupangParent = chrome.contextMenus.create({
  title: `在 coupang中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: coupangUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update( coupangParent, {
    title: `在 coupang中搜索此产品：${coupang.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  chrome.tabs.create(
    { url: `https://www.coupang.com/np/search?q=${encodeURI(coupang.title)}&from_id=${coupang.id}` })
  // setTimeout(() => {
  //
  // }, 5000)
}
