/* 监听ebay广告列表返回的数据 */
let amazonData = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'amazon_search_id': {
      console.log(request)
      amazonData = request
      chrome.contextMenus.update(amazonParent, {
        title: `在amazon ${amazonData.site}中搜索此产品：${amazonData.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const amazonSite = {
  SG:	'amazon.sg',
  IT:	'amazon.it',
  IN:	'amazon.in',
  FR:	'amazon.fr',
  ES:	'amazon.es',
  DE:	'amazon.de',
  MX:	'amazon.com.mx',
  BR:	'amazon.com.br',
  AU:	'amazon.com.au',
  US:	'amazon.com',
  GB:	'amazon.co.uk',
  JP:	'amazon.co.jp',
  CA:	'amazon.ca',
  AE:	'amazon.ae',
}
const amazonUrlPatterns = ['http://istore.szecommerce.com/amazon/product', 'http://istore.szecommerce.com/amazon/product/index',"http://dev.istore2.com/amazon/product/index"]
const amazonParent = chrome.contextMenus.create({
  title: `在amazon中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: amazonUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update(amazonParent, {
    title: `在amazon ${amazonData.site}中搜索此产品：${amazonData.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  // 注意不能使用location.href，因为location是属于background的window对象
  // console.log(info)
  // console.log(tab)
  chrome.tabs.create(
    { url: `https://www.${amazonSite[amazonData.site]}/s?k=${encodeURI(amazonData.title)}${amazonData.id ? '&from_id=' + amazonData.id : '' }` })
  // setTimeout(() => {
  //
  // }, 5000)
}
