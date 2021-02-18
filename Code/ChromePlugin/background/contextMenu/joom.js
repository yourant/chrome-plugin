/* 监听joom广告列表返回的数据 */
let joomData = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'joom_search_id': {
      console.log(request)
        joomData = request
      chrome.contextMenus.update(joomParent, {
        title: `在Joom中搜索此产品：${joomData.title}`
      })
    }
      break
  }
})


const joomUrlPatterns = ['http://istore.szecommerce.com/joom/productmanage', 'http://istore.szecommerce.com/joom/productmanage/index']
const joomParent = chrome.contextMenus.create({
  title: `在Joom中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: joomUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update(joomParent, {
    title: `在Joom中搜索此产品：${joomData.title}`
  })
}, 1000)

/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  // 注意不能使用location.href，因为location是属于background的window对象

  chrome.tabs.create({ url: `https://www.joom.com/en/search/q.${encodeURI(joomData.title)}?from_id=${joomData.id}` }
  )
  // setTimeout(() => {
  //
    // }, 5000)
}
