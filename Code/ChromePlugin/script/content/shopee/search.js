// 监听有关background,popups的信息
// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
let requestParams = {}
chrome.extension.onMessage.addListener(function (request, _, response) {
  switch (request.code) {
    case 'search': {
      requestParams = request
      console.log(request)
    }
      break
    default: {
    }
  }
})
document.onload = function() {
  searchFn.init()
}
document.addEventListener(
  'DOMContentLoaded',
  function () {
    searchFn.init()
  },
  false
)
const searchFn = {
  init() {
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      this.setTabUrl()
    } else {
      this.init()
    }
  },
  checkProduct() {

  },
  setTabUrl() {
    const from_id = common.getRequest().from_id
    const collection_sku_id = common.getRequest().collection_sku_id
    if (from_id || collection_sku_id) {
      setInterval(() => {
        $('.btn-solid-primary').unbind('click').on('click', () => false)
        $('.btn-solid-primary').on('click', function() {
          location.href = `${location.origin}/search?keyword=${encodeURI($('.shopee-searchbar-input__input').val())}&${ from_id? 'from_id=' + from_id : '' }${ collection_sku_id? 'collection_sku_id=' + collection_sku_id : '' }`
        })
        if ($('.shopee-search-item-result__items a').length) {
          $('.shopee-search-item-result__items a').each((i, v) => {
            if (!$(v).attr('data-href')) {
              $('.shopee-search-item-result__items a').on('click', () => false)
              $(v).attr('data-href', $(v).attr('href'))
              $(v).attr('href', 'javascript:;')
              $(v).removeAttr('target')
              $(v).unbind('click').on('click', function(e) {
                const baseUrl = $(e.target).parents('a').attr('data-href')
                const dg = baseUrl.indexOf('?') > -1 ? '&' : '?'
                const keyword_dg = Boolean(from_id || collection_sku_id) ? '&' : ''
                const params = {
                  code: 'create-tab',
                  url: `${location.origin}${baseUrl}${dg}${ from_id? 'from_id=' + from_id : '' }${ collection_sku_id? 'collection_sku_id=' + collection_sku_id : '' }${keyword_dg}keyword=${encodeURI($('.shopee-searchbar-input__input').val())}`
                }
                chrome.runtime.sendMessage(params)
              })
            }
          })
        }
      }, 500)
    }
  }
}