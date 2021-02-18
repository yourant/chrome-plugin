window.onload = function() {
  detailFn.init()
}

let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: true,
  baseObj: {},
  userInfo: {},
  init() {
    const that = this
    /**
     * @description: 检测joom广告
     */
    const proNo = location.pathname.split('/')[location.pathname.split('/').length - 1]
    chrome.runtime.sendMessage({
      code: 'checkedAdvt',
      message: 'success',
      data: {
        platform: 'joom',
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
      this.init()
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
          that.login()
        }
      }
    )
  },
  login() {
    chrome.runtime.sendMessage(
      {
        code: 'getUserCode',
        message: 'success',
        data: ''
      },
      response => {
        if (response) {
          this.userInfo = response
          this.checkProduct()
        } else {
          alert('登录校验失败，请使用权限系统账号登录插件（如已登录，请点击退出按钮重新登录）')
          return
        }
      }
    )
  },
  async checkProduct() {
    $('#sfc-collect-mask').css('display', 'none')
    this.clickRun(common.productId)
    detailFn.isCollect = common.isCollect
  },
  clickRun(product_id) {
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
    const category = joomLogic.fetchCategory()
    const attributes = await joomLogic.fetchAttributes()
    const main_image = await joomLogic.fetchMainImage()
    const details = await joomLogic.fetchDetail()
    const detail = {
      platform: 'joom',
      site: 'ru',
      site_domain: window.location.hostname,
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      product_name: $('.h1___UYvvN').text().trim(), // 标题
      product_type: attributes.length > 1 ? 20 : 10,
      product_no: location.pathname.split('/')[location.pathname.split('/').length - 1],
      category, // 分类目录
      main_image,
      brand: $('.brandNameLink___3mJ4M').text().trim(), // 品牌
      month_sales: -1, // 月销量
      total_sales: -1, // 总销量
      favorite: -1, // 收藏数
      total_comment: $('.filter-all span span').eq(0).text(), // 累积评论
      good_comment: (Number($('.filter-fiveStars___3NRvJ span span').text()) + Number($('.filter-fourStars___CndLp span span').text())) || '', // 好评数
      comment_percent: $('.value___znPTi').eq(0).text(),
      attributes,
      details,
      shop: joomLogic.fetchShop(),
      video: '',
      platform_url: window.location.href,
      user_id: this.userInfo.userId,
      user_name: this.userInfo.name,
      import_user: this.userInfo.username,
      source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”；
      keyword: document.referrer.indexOf('search') !== -1 ? document.referrer.split('.')[document.referrer.split('.').length - 1] : ''
    }
    console.log(detail)
    const params = {
      code: '0',
      data: detail,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    common.selectAttributeFn(params)
  }
}
