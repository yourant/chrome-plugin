/* 监听ebay广告列表返回的数据 */
let rakuten = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'rakuten_search_id': {
       rakuten = request
      chrome.contextMenus.update(rakutenParent, {
        title: `在 rakuten 中搜索此产品：${rakuten.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const  rakutenUrlPatterns = ['http://ad.szecommerce.com/rakuten/advertising']
const  rakutenParent = chrome.contextMenus.create({
  title: `在 rakuten中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: rakutenUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update( rakutenParent, {
    title: `在 rakuten中搜索此产品：${rakuten.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  chrome.tabs.create(
    { url: `https://search.rakuten.co.jp/search/mall/${rakuten.title.replace(/\s/, '%2B').replace(/[\s/]/g, '+').replace(/\,/g, '%2C')}/?from_id=${rakuten.id}` })
  // setTimeout(() => {
  //
  // }, 5000)
}
