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
      const that = this
      panel.unbind('click').on('click', function() {
        $('#sfc-collect-mask').attr('style', 'display:block')
        that.checkProduct()
      })
      //   $("html").animate(
      //     {
      //         scrollTop: 10000
      //     },
      //     5000,function(){
      //       that.setTabUrl()
      //       $("html").animate(
      //         {
      //             scrollTop: 0
      //         },
      //         5000
      //     );
      //     }
      // );

    } else {
      this.init()
    }
  },
  checkProduct() {

  }
  // setTabUrl() {
  //   $('.s-result-item').each((i, v) => {
  //     $(v).find('a').each((i1, v1) => {
  //       $(v1).attr('data-href', $(v1).attr('href'))
  //       $(v1).attr('href', 'javascript:;')
  //       $(v1).on('click', function (e) {
  //         const baseUrl = $(e.target).parents('a').attr('data-href')
  //         const dg = baseUrl.indexOf('?') > -1 ? '&' : '?'
  //         const params = {
  //           code: 'create-tab',
  //           url: `${location.origin}${baseUrl}${dg}${common.getRequest().from_id ? ('from_id=' + common.getRequest().from_id) : '' }`
  //         }
  //         chrome.runtime.sendMessage(params)
  //       })
  //     })
  //   })
  // }
}