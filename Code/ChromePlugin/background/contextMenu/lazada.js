/* 监听ebay广告列表返回的数据 */
let  lazada = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'lazada_search_id': {
      console.log(request)
       lazada = request
      chrome.contextMenus.update(lazadaParent, {
        title: `在 lazada中搜索此产品：${lazada.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const  lazadaUrlPatterns = ['http://dev.istore2.com/lazada/product/index', 'http://dev.istore2.com/lazada/product*',"http://istore.szecommerce.com/lazada/product*",'http://istore.szecommerce.com/lazada/product/index']
const  lazadaParent = chrome.contextMenus.create({
  title: `在 lazada中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: lazadaUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update( lazadaParent, {
    title: `在 lazada中搜索此产品：${lazada.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  chrome.tabs.create(
    
    { url: `https://www.lazada.com.my/catalog?q=${encodeURI(lazada.title)}&from_id=${lazada.id}` })
  // setTimeout(() => {
  //
  // }, 5000)
}
