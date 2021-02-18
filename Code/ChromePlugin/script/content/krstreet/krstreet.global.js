document.addEventListener(
  'DOMContentLoaded',
  function() {
    detailFn.sfcAbled()
  },
  false
)
const detailFn = {
  // sfc button 可用
  sfcAbled() {
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      let panel = $('.spider-append-icon')
      panel.removeClass('spider-color-forbidden')
      panel.attr('title', '跳转语言为Korean的平台')
      const that = this
      panel.unbind('click').on('click', function() {
        that.switchLanguage()
      })
    } else {
      this.sfcAbled()
    }
  },
  // 
  switchLanguage() {
    const prdNo = window.location.search.slice(1).split('&').filter(item => {
      return item.includes('prdNo')
    })[0].slice(6)
    alert('页面将新打开对应的语言为韩语的网站')
    window.open(`http://www.11st.co.kr/product/SellerProductDetail.tmall?method=getSellerProductDetail&prdNo=${prdNo}${common.getRequest().from_id ? ('&from_id=' + common.getRequest().from_id) : ''}`)
  }
}