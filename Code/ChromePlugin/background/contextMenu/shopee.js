/* 监听ebay广告列表返回的数据 */
let shopeeData = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'shopee_search_id': {
      shopeeData = request
      chrome.contextMenus.update(shopeeParent, {
        title: `在shopee ${shopeeData.site}中搜索此产品：${shopeeData.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const shopeeSite = {
  my: 'https://shopee.com.my/',
  sg: 'https://shopee.sg/',
  tw: 'http://shopee.tw/',
  id: 'https://shopee.co.id/',
  th: 'https://shopee.co.th/',
  vn: 'https://shopee.vn/',
  ph: 'https://shopee.ph/',
  br: 'https://shopee.com.br/'
}
const shopeeUrlPatterns = ['http://ad.szecommerce.com/shopee/advertising']
const shopeeParent = chrome.contextMenus.create({
  title: `在shopee中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: shopeeUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update(shopeeParent, {
    title: `在shopee ${shopeeData.site}中搜索此产品：${shopeeData.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  // 注意不能使用location.href，因为location是属于background的window对象
  // console.log(info)
  // console.log(tab)
  chrome.tabs.create(
    { url: `${shopeeSite[shopeeData.site]}search?keyword=${encodeURI(shopeeData.title)}${shopeeData.id ? '&from_id=' + shopeeData.id : '' }` })
  // setTimeout(() => {
  //
  // }, 5000)
}
