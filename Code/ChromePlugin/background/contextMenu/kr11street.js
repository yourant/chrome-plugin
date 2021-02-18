/* 监听ebay广告列表返回的数据 */
let  kr11street = {}
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'kr11street_search_id': {
      kr11street = request
      chrome.contextMenus.update(kr11streetParent, {
        title: `在 kr11street 中搜索此产品：${kr11street.title}`
      })
    }
      break
  }
})

/* 右键菜单*/
const  kr11streetUrlPatterns = ['http://ad.szecommerce.com/kr11street/advertising']
const  kr11streetParent = chrome.contextMenus.create({
  title: `在 kr11street中搜索此产品`, // 显示的文字，除非为“separator”类型否则此参数必需，如果类型为“selection”，可以使用%s显示选定的文本
  contexts: ['link'], // 上下文环境，可选：["all", "page", "frame", "selection", "link", "editable", "image", "video", "audio"]，默认page
  documentUrlPatterns: kr11streetUrlPatterns,
  onclick: genericOnClick
})
setTimeout(() => {
  chrome.contextMenus.update( kr11streetParent, {
    title: `在 kr11street中搜索此产品：${kr11street.title}`
  })
}, 1000)

function getInnocentWord(keyword) {
	var reg = /[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318f a-zA-Z0-9]+/;
	while(keyword.match(reg)) {
		keyword = keyword.replace(reg,"");
	}

	while(keyword.match(/\s/)) {
		keyword = keyword.replace(/\s/,"");
	}

	return keyword;
}
/* 菜单的点击事件 */
function genericOnClick(info, tab) {
  chrome.tabs.create(
    { url: `http://search.11st.co.kr/Search.tmall?kwd=${encodeURIComponent(encodeURIComponent(kr11street.title))}&from_id=${kr11street.id}` })
  // setTimeout(() => {
  //
  // }, 5000)
}