/* 监听wish广告列表返回的数据 */
let wishData = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'wish_search_id': {
      console.log(request)
      wishData = request
      chrome.contextMenus.update(wishParent, {
        title: `在wish ${wishData.site}中搜索此产品：${wishData.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const wishUrlPatterns = ['http://istore.szecommerce.com/wish/product/', 'http://istore.szecommerce.com/wish/product/index']
const wishParent = chrome.contextMenus.create({
  title: `在wish中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: wishUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update(wishParent, {
    title: `在wish ${wishData.site}中搜索此产品：${wishData.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  // 注意不能使用location.href，因为location是属于background的window对象

  chrome.tabs.create({ url: `https://www.wish.com/search/${encodeURI(wishData.title)}?from_id=${wishData.id}` }
  )
  // setTimeout(() => {
  //
    // }, 5000)
}
