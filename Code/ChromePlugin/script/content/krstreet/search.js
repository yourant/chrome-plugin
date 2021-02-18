document.addEventListener('DOMContentLoaded', function () {
  searchFn.init()
}, false)
const searchFn = {
  init() {
    common.forbiddenIcon()
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      // let panel = $('.spider-append-icon')
      // panel.removeClass('spider-color-forbidden')
      // panel.attr('title', '跳转到详情页面')
      // panel.innerText = ''
      // panel.innerText = '跳转详情'
      // const that = this
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
      setInterval(() => {
        $('#tSearch button.search_button').attr('onclick', '').unbind('click').on('click', () => false)
        $('#tSearch button.search_button').on('click', function() {
          window.location.href = ''
          // let val = $('#tSearch input.search_text').val()
          const searchKeyword = JSON.parse($('.search_button').attr('data-log-body')).search_keyword
          setTimeout(() => {
            let url = `${location.origin}/Search.tmall?kwd=${encodeURI(encodeURI(searchKeyword))}&${ from_id ? 'from_id=' + from_id : '' }${ collection_sku_id ? 'collection_sku_id=' + collection_sku_id : '' }`
            window.location.href = url
            if ($('a[data-log-actionid-label="product"]').length) {
              $('a[data-log-actionid-label="product"]').each((i, v) => {
                $(v).attr('onclick', '').unbind('click').on('click', () => false)
                $(v).attr('href', 'javascript:;')
              })
            }
          }, 200)
        })
        if ($('a[data-log-actionid-label="product"]').length) {
          $('a[data-log-actionid-label="product"]').each((i, v) => {
            $(v).attr('onclick', '').unbind('click').on('click', () => false)
            const productNo = JSON.parse($(v).attr('data-log-body')).product_no
            const searchKeyword = JSON.parse($('.search_button').attr('data-log-body')).search_keyword
            // const val = JSON.parse($('.search_button').attr('data-log-body')).search_keyword
            let href = `http://www.11st.co.kr/products/${productNo}?kwd=${encodeURI(encodeURI(searchKeyword))}&${ from_id ? 'from_id=' + from_id : '' }${ collection_sku_id ? 'collection_sku_id=' + collection_sku_id : '' }`
            $(v).attr('href', 'javascript:;')
            $(v).on('click', function(e) {
              const params = {
                code: 'create-tab',
                url: href
                // url: `${urlData}${dg}${ from_id ? 'from_id=' + from_id : '' }${ collection_sku_id ? 'collection_sku_id=' + collection_sku_id : '' }`
              }
              chrome.runtime.sendMessage(params)
            })
          })
        }
      }, 500)
    }
  }
}