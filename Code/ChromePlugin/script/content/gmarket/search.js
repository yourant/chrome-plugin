// 监听有关background,popups的信息
// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
// let requestParams = {}
// chrome.extension.onMessage.addListener(function (request, _, response) {
//   switch (request.code) {
//     case 'search': {
//       requestParams = request
//       console.log(request)
//     }
//       break
//     default: {
//     }
//   }
// })
document.addEventListener(
  'DOMContentLoaded',
  function () {
    detailFn.init()
  },
  false
)
let startTime = 0
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
    console.log(collection_sku_id, 444)
    if (from_id || collection_sku_id) {
      document.querySelector('.button__search').outerHTML = document.querySelector('.button__search').outerHTML.replace('button', 'div')
      $('.button__search').unbind('click').on('click', function() {
        // alert(1)
        location.href = `${location.origin}${location.pathname}?keyword=${encodeURI($('.form__input').val())}&${ from_id? 'from_id=' + from_id : '' }${ collection_sku_id? 'collection_sku_id=' + collection_sku_id : '' }`
      })
      setInterval(() => {
        $('.box__item-container a').each((i, v) => {
          if (!$(v).attr('data-href')) {
            $(v).attr('data-href', $(v).attr('href'))
            $(v).attr('href', 'javascript:;')
            $(v).removeAttr('target')
            $(v).unbind('click').on('click', function (e) {
              const baseUrl = $(e.target).parents('a').attr('data-href')
              const dg = baseUrl.indexOf('?') > -1 ? '&' : '?'
              const params = {
                code: 'create-tab',
                url: `${baseUrl}${dg}${ from_id? 'from_id=' + from_id : '' }${ collection_sku_id? 'collection_sku_id=' + collection_sku_id : '' }`
              }
              chrome.runtime.sendMessage(params)
            })
          }
        })
      }, 500)
    }
  }
}