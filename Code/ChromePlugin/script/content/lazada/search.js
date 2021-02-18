// 监听有关background,popups的信息
// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
let requestParams = {}
chrome.extension.onMessage.addListener(function(request, _, response) {
  switch (request.code) {
    case 'search': {
      requestParams = request
    }
      break
    default: {
    }
  }
})
document.addEventListener(
  'DOMContentLoaded',
  function() {
    detailFn1.init()
  },
  false
)
const detailFn1 = {

  init() {
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      let panel = $('.spider-append-icon')
      panel.removeClass('spider-color-forbidden')
      panel.attr('title', '跳转到详情页面')
      panel.innerText = ''
      panel.innerText = '跳转详情'
      panel.unbind('click').on('click', function() {
        $('#sfc-collect-mask').attr('style', 'display:block')
      })
      // this.setTabUrl()
    } else {
      this.init()
    }
  },
  // setTabUrl() {
  //   const from_id = common.getRequest().from_id
  //   const collection_sku_id = common.getRequest().collection_sku_id
  //   if (from_id || collection_sku_id) {
  //     setInterval(() => {
  //       $('.search-box__button--1oH7').unbind('click').on('click', () => false)
  //       $('.search-box__button--1oH7').on('click', function() {
  //         location.href = `${location.origin}/catalog/?q=${encodeURI($('.search-box__input--O34g').val())}&${ from_id? 'from_id=' + from_id : '' }${ collection_sku_id? 'collection_sku_id=' + collection_sku_id : '' }`
  //       })
  //       if ($('.c1_t2i div[data-qa-locator="product-item"] a').length) {
  //         $('.c1_t2i div[data-qa-locator="product-item"] a').each((i, v) => {
  //           if (!$(v).attr('data-href')) {
  //             $('.c1_t2i div[data-qa-locator="product-item"] a').on('click', () => false)
  //             $(v).attr('data-href', $(v).attr('href'))
  //             $(v).attr('href', 'javascript:;')
  //             $(v).removeAttr('target')
  //             $(v).unbind('click').on('click', function(e) {
  //               const baseUrl = $(e.target).parents('a').attr('data-href')
  //               const dg = baseUrl.indexOf('?') > -1 ? '&' : '?'
  //               const keyword_dg = Boolean(from_id || collection_sku_id) ? '&' : ''
  //               const params = {
  //                 code: 'create-tab',
  //                 url: `${baseUrl}${dg}${ from_id? 'from_id=' + from_id : '' }${ collection_sku_id? 'collection_sku_id=' + collection_sku_id : '' }${keyword_dg}keyword=${encodeURI($('.search-box__button--1oH7').val())}`
  //               }
  //               chrome.runtime.sendMessage(params)
  //             })
  //           }
  //         })
  //       }
  //     }, 500)
  //   }
  // }
}