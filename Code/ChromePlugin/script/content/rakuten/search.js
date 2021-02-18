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
document.addEventListener(
  'DOMContentLoaded',
  function () {
    detailFn.init()
  },
  false
)
const detailFn = {
  init() {
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      // let panel = $('.spider-append-icon')
      // panel.removeClass('spider-color-forbidden')
      // panel.attr('title', '跳转到详情页面')
      // panel.innerText = ''
      // panel.innerText = '跳转详情'
      const that = this
      // panel.unbind('click').on('click', function () {
      //   $('#sfc-collect-mask').attr('style', 'display:block')
      //   that.checkProduct()
      // })
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
      $('#ri-cmn-hdr-button').removeAttr('id').removeAttr('type')
      $('.ri-cmn-hdr-search-btn').unbind('click').on('click', function() {
        location.href = `${location.origin}/search/mall/${$('#ri-cmn-hdr-sitem').val().replace(/\s/, '%2B').replace(/[\s/]/g, '+').replace(/\,/g, '%2C')}/?${ from_id? 'from_id=' + from_id : '' }${ collection_sku_id? 'collection_sku_id=' + collection_sku_id : '' }`
      })
      // if($('.searchresultitem').length) {
      //   setInterval(() => {
      //     $('.searchresultitem').each((i, v) => {
      //       if (!$(v).attr('data-href')) {
      //         $('.searchresultitem image a').on('click', () => false)
      //         $(v).attr('data-href', $(v).attr('href'))
      //         $(v).attr('href', 'javascript:;')
      //         $(v).removeAttr('target')
      //         $(v).unbind('click').on('click', function (e) {
      //           const baseUrl = $(v).find('.image a').attr('href')
      //           const dg = baseUrl.includes('?') ? '&' : '?'
      //           const keyword_dg = Boolean(from_id || collection_sku_id) ? '&' : ''
      //           const params = {
      //             code: 'create-tab',
      //             url: `${baseUrl}${dg}${ from_id? 'from_id=' + from_id : '' }${ collection_sku_id? 'collection_sku_id=' + collection_sku_id : '' }${keyword_dg}keyword=${encodeURI($('.searchInput').val())}`
      //           }
      //           chrome.runtime.sendMessage(params)
      //         })
      //       }
      //     })
      //   }, 500)
      // }
    }
  }
}