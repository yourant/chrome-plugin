/*
 * badge
 * 所谓badge就是在图标上显示一些文本，可以用来更新一些小的扩展状态提示信息。
 * 因为badge空间有限，所以只支持4个以下的字符（英文4个，中文2个）。
 * badge无法通过配置文件来指定，必须通过代码实现，设置badge文字和颜色可以分别使用setBadgeText()和setBadgeBackgroundColor()。
 * */
chrome.browserAction.setBadgeText({ text: '竞品' })
chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] })

/* 监听ebay广告列表返回的数据 */
let data = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'ebay_search_id': {
      console.log(request)
      data = request
      chrome.contextMenus.update(parent, {
        title: `在eBay ${data.site}中搜索此产品：${data.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const site = {
  US: 'ebay.com',
  UK: 'ebay.co.uk',
  DE: 'ebay.de',
  AU: 'ebay.com.au',
  ES: 'ebay.es',
  FR: 'ebay.fr',
  CA: 'ebay.ca',
  IT: 'ebay.it'
}
const urlPatterns = ['http://ebay.szecommerce.com/ebay/advertising']
const parent = chrome.contextMenus.create({
  title: `在eBay中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: urlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update(parent, {
    title: `在eBay ${data.site}中搜索此产品：${data.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  // 注意不能使用location.href，因为location是属于background的window对象
  // console.log(info)
  // console.log(tab)
  chrome.tabs.create(
    { url: `https://www.${site[data.site]}/sch/i.html?_nkw=${encodeURI(data.title)}&_sacat=0${data.id ? '&from_id=' + data.id : '' }` })
  // setTimeout(() => {
  //
  // }, 5000)
}
