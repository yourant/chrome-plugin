document.addEventListener(
  'DOMContentLoaded',
  function() {
    detailFn.init()
  },
  false
)

const detailFn = {
  init() {
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      let panel = $('.spider-append-icon')
      panel.removeClass('spider-color-forbidden')
      panel.attr('title', '点击跳转到详情页面')
      const that = this
      panel.unbind('click').on('click', function() {
        $('#sfc-collect-mask').attr('style', 'display:block')
        that.checkProduct()
      })
    } else {
      this.init()
    }
  },
  checkProduct() {
    alert('即将跳转到详情页面')
    document.querySelector('.item-details a').click()
  }
}