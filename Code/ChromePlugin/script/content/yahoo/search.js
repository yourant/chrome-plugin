// 监听有关background,popups的信息
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
      panel.addClass('spider-color-forbidden')
      panel.innerText = ''
      panel.innerText = '跳转详情'
      this.setTabUrl()
    } else {
      this.init()
    }
  },
  setTabUrl() {

    console.log(common.getRequest().from_id)
    console.log( common.getRequest().collection_sku_id)
    const from_id = common.getRequest().from_id
    const collection_sku_id = common.getRequest().collection_sku_id
    if (from_id || collection_sku_id) {
      console.log('进入')
      setInterval(()=>{
        $('.SearchBox__submitButton').unbind('click').on('click', () => false)
        $('.SearchBox__submitButton').on('click',function() {
          console.log('aaaaa')
          location.href = `${location.origin}/search?p=${encodeURI($('#h_srch > p').find('input').val())}&${from_id ? 'from_id=' + from_id : ''}${collection_sku_id ? 'collection_sku_id=' + collection_sku_id : ''}`
        })
      },500)
      // $('.Column a').each((i, v) => {
      //     const baseUrl = $(v).attr('href')
      //     const dg = baseUrl.indexOf('?') > -1 ? '&' : '?'
      //     $(v).attr('href', `${baseUrl}+${dg}+${from_id ? 'from_id=' + from_id : ''}${collection_sku_id ? 'collection_sku_id=' + collection_sku_id : ''}`)
      // })



    }


    $('.LoopList__item').each((i, v) => {
      console.log('执行了')
      $(v).find('a').each((i1, v1) => {
        const baseUrl = $(v1).attr('href')
        const dg = baseUrl.indexOf('?') > -1 ? '&' : '?'
        $(v1).attr('href', `${baseUrl}${dg}${from_id ? 'from_id=' + from_id : ''}${collection_sku_id ? 'collection_sku_id=' + collection_sku_id : ''}`)
        console.log($(v1).attr('href'))

        /*
         $(v1).on('click', function (e) {

         const baseUrl = $(e.target).parents('a').attr('data-href')
         const dg = baseUrl.indexOf('?') > -1 ? '&' : '?'
         const params = {
         code: 'create-tab',
         url: `${baseUrl}${dg}from_id=${common.getRequest().from_id}`
         }
         chrome.runtime.sendMessage(params)
         })
         */


      })
    })

  }
}