// 监听有关background,popups的信息
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'desc': {
      if (!detailFn.fetchDesc.has) {
        detailFn.fetchDesc = {
          has: true,
          ...request.data
        }
      }
    }
      break
    default: {
    }
  }
  sendResponse('')
})
// window.onload = function() {
//   detailFn.init()
// }
document.addEventListener(
  'DOMContentLoaded',
  function() {
    detailFn.init()
  },
  false
)
let t = null
let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: false,
  fetchDesc: {
    has: false,
    description: '',
    images: []
  },
  // 用户
  userInfo: {},
  // init
  async init() {
    const that = this
    /**
     * @description: 检测Gmarket广告
     */
    const proNo = $('.pdnum').text().match(/\d+/)[0]
    chrome.runtime.sendMessage({
      code: 'checkedAdvt',
      message: 'success',
      data: {
        platform: 'Gmarket',
        method: 'istore.adv.productisistoreadvt',
        advt_id: [proNo]
      }
    }, function(response) {
      if (response.type === 0) {
        alert(response.msg)
      }
      if (response.data && response.data[proNo]) {
        $('#append_details').css('background-color', '#ccc')
        $('#append_details').css('pointer-events', 'none') //阻止用户的点击动作产生任何效
        $('#append_details').css('cursor', 'not-allowed')
        return
      }
    })
    if ($('.spider-append-icon').length) {
      document.body.scrollTop = 0
      let panel = $('.spider-append-icon')
      panel.removeClass('spider-color-forbidden')
      panel.attr('title', '点击获取竞品数据')
      panel.unbind('click').on('click', function() {
        startTime = new Date().getTime()
        that.checkVersion()
      })
    } else {
      that.init()
    }
  },
  checkVersion() {
    const that = this
    chrome.runtime.sendMessage(
      {
        code: 'checkVersion',
        message: 'success',
        data: ''
      },
      response => {
        if (response === 'later') {
          alert('版本已过期，请下载最新版本')
          window.open(`http://xian.suntekcorps.com:8825/help/spider`)
        } else {
          that.Login()
        }
      }
    )
  },
  Login() {
    chrome.runtime.sendMessage(
      {
        code: 'getUserCode',
        message: 'success',
        data: ''
      },
      response => {
        if (response) {
          // 已登录
          this.userInfo = response
          this.checkProduct()
        } else {
          // 未登录
          alert('登录校验失败，请使用权限系统账号登录插件（如已登录，请点击退出按钮重新登录）')
          return
        }
      }
    )
  },
  // product_id
  checkProduct() {
    $('#sfc-collect-mask').css('display', 'none')
    this.clickRun(common.productId)
    detailFn.isCollect = common.isCollect
  },
  async clickRun(product_id) {
    let _this = this
    if (product_id) {
      if (!detailFn.isCollect) { //commonjs弹框输入产品确定后调用这个方法，考虑手动输入还要判断是否istro产品存在
        chrome.runtime.sendMessage(
          {
            //发送请求产品id是否存在
            code: 'haveProduct',
            message: 'success',
            data: {
              platform: 'ebay',
              method: 'istore.adv.getproductallinfo',
              product_id: product_id,
              es_local: 'US'
            }
          },
          function(response) {
            $('#sfc-collect-mask').attr('style', 'display:none')
            if (response.ack) {
              _this.fetchProduct(product_id)
            } else {
              alert(response.msg) //没有这个产品
              return
            }
            // 收到来自后台回复消息
          }
        )
      } else {
        $('#sfc-collect-mask').attr('style', 'display:block')
        _this.fetchProduct(product_id)
      }
    } else {
      common.selectIdFrom() // 返回手动输入的ID字段和ID来源
      detailFn.is_manual_id = true
    }
  },
  async fetchProduct(product_id) {
    location.href = 'javascript:document.body.setAttribute(\'data-goods\', JSON.stringify(goods));'
    const getData = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(JSON.parse(document.body.getAttribute('data-goods')))
        })
      })
    }
    const baseObj = await getData()
    // this.fetchAttribute()
    const collection_sku_id = common.getRequest().collection_sku_id
    const product_details = {
      platform: 'gmarket',
      product_name: baseObj['GoodsName'], // 标题
      product_type: gmarketLogic.fetchAttribute().length > 1 ? 20 : 10,
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      site_domain: window.location.hostname,
      product_no: baseObj['GoodsCode'], // 产品id 根据url 取
      category: gmarketLogic.fetchCategory(), // 分类目录
      main_image: gmarketLogic.fetchMainImage(baseObj),
      brand: baseObj['BrandName'], // 品牌
      month_sales: -1, // 月销量
      total_sales: -1, // 总销量
      favorite: -1, // 收藏数
      total_comment: $('#txtReviewTotalCount').text().trim() || '0', // 累积评论
      good_comment: -1, // 好评数
      comment_percent: -1, // 好评度
      attributes: gmarketLogic.fetchAttribute(baseObj['GoodsCode']),
      details: gmarketLogic.fetchDetails(this.fetchDesc),
      shop: gmarketLogic.fetchShop(),
      video: '',
      platform_url: window.location.href,
      user_id: this.userInfo.userId,
      user_name: this.userInfo.name,
      import_user: this.userInfo.username,
      source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”；
      keyword: document.referrer.indexOf('?') > -1 ? (common.getRequest('?' + document.referrer.split('?')[1]).keyword || '') : ''
    }
    const params = {
      code: '0',
      data: product_details,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    console.log('=====================详情数据===========================')
    console.log(product_details)
    // chrome.runtime.sendMessage({
    //     code: '0',
    //     message: 'success',
    //     data: detail
    //   },
    //   function (response) {
    //     // $('#sfc-collect-mask').attr('style', 'display:none')
    //     console.log(response)
    //     // 收到来自后台回复消息
    //     alert(response.message)
    //     // $('#spiderPopTab').attr('style', 'display: none')
    //     // $('#bg').prop('display', 'none')
    //   }
    // )
    /**
     * @description: 属性选择
     */
    common.selectAttributeFn(params)
  }
}