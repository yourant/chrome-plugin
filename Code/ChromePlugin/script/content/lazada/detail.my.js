window.onload = function() {

  $('#append_details').removeClass('spider-color-forbidden')
  common.forbiddenLazadaIcon()
  detailFn.init()
}
let userCode = ''
let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: true,
  userInfo: {},
  init: function() {
    // let descItemNumber = $("#product-coupon-inner").attr("ae_object_value"); //获取aliExpress item number文本内容
    let descItemNumber = $('.specification-keys').find('li').eq(1).find('.html-content.key-value').text() //获取 item number文本内容
    chrome.runtime.sendMessage(
      {
        //插件监听请求
        code: 'haveAdvt',
        message: 'success',
        data: {
          item_id: descItemNumber,
          platform: 'lazada'
        }
      },
      function(response) {
        console.log(response)

        if (response.data.in[0] && response.data.in[0].indexOf(descItemNumber) != -1) {
          //383485052707: true存在这个就不用采集
          $('#append_details').css('background-color', '#ccc')
          $('#append_details').css('pointer-events', 'none') //阻止用户的点击动作产生任何效
          alert('自己平台广告不采集')
          return
        }
      }
    )
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      let panel = $('.spider-append-icon')
      panel.removeClass('spider-color-forbidden')
      panel.attr('title', '点击获取竞品数据')
      const that = this
      panel.unbind('click').on('click', function() {
        startTime = new Date().getTime()
        that.checkVersion()
      })
    } else {
      this.init()
    }
  },
  login() {
    chrome.runtime.sendMessage({
      code: 'getUserCode',
      message: 'success',
      data: ''
    }, response => {
      if (response) {
        // 已登录
        this.userInfo = response
        this.clickIcon()
      } else {
        // 未登录
        // window.open('http://account.suntekcorps.com:8080/')
        alert('登录校验失败，请使用权限系统账号登录插件（如已登录，请点击退出按钮重新登录）')
        return
      }
    })
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
  async clickIcon() {
    this.clickRun(common.productId)
    detailFn.isCollect = common.isCollect
  },
  clickRun(product_id) {

    let that = this
    if (product_id) {
      if (!detailFn.isCollect) {
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
              // alert('此产品存在')
              $('#sfc-collect-mask').attr(
                'style',
                'display:block'
              )
              $('body,html').scrollTop(0)
              /* 首次初始化所有规格选项 */
              // that.initSpecifics()
              $('html').animate({
                scrollTop: 10000
              }, 5000, () => {
                that.getProductData(product_id)
                $('body,html').animate({ scrollTop: 0 }, 50)
              })
              //that.getPageDetails(product_id)
            } else {
              alert(response.msg) //没有这个产品
              return
            }
            // 收到来自后台回复消息
          }
        )
      } else {
        $('#sfc-collect-mask').attr(
          'style',
          'display:block'
        )
        $('body,html').scrollTop(0)
        /* 首次初始化所有规格选项 */
        // that.initSpecifics()
        $('html').animate({
          scrollTop: 10000
        }, 5000, () => {
          that.getProductData(product_id)
          $('body,html').animate({ scrollTop: 0 }, 50)
        })
      }

    } else {
      // alert('请点击采集按钮输入Istore Product ID')
      common.selectIdFrom() // 返回手动输入的ID字段和ID来源
      detailFn.is_manual_id = true
    }
  },
  getProductData: async function(product_id) {
    $('#sfc-collect-mask').css('display', 'block')
    $('body,html').animate({
      'scrollTop': 5000
    }, 2000)
    await common.delay(3000)
    $('body,html').animate({
      'scrollTop': 0
    }, 0)
    const { video, main_image } = LazadaLogic.getMainImages()
    const shop = LazadaLogic.getShop()
    const details = await LazadaLogic.getDetails()
    const { total_sales, total_comment, good_comment, comment_percent } = await LazadaLogic.getEvaluation()
    const attributes = await LazadaLogic.fetchAttribute()
    const category = LazadaLogic.fetchCategory()
    const product_no = LazadaLogic.getProductNo()
    const product_name = LazadaLogic.getProductTitle()
    const brand = LazadaLogic.getBrand()
    const product_details = {
      platform: 'lazada',
      site: 'my',
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      product_name, // 标题
      product_type: attributes.length > 1 ? 20 : 10,
      product_no,
      category,
      main_image,
      brand, // 品牌
      month_sales: -1, // 月销量
      total_sales, // 总销量
      favorite: -1, // 收藏数
      total_comment, // 累计评论
      good_comment, // 好评数
      comment_percent, // 好评度
      attributes,
      details,
      shop,
      video,
      site_domain: window.location.hostname,
      platform_url: window.location.href,
      user_id: this.userInfo.userId,
      user_name: this.userInfo.name,
      import_user: this.userInfo.username,
      source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”；
      keyword: document.referrer.indexOf('?') > -1 ? decodeURI(common.getRequest('?' + document.referrer.split('?')[1]).q || '') : ''
    }
    console.log('**************************details***************************************************')
    console.log(product_details)

    const params = {
      code: '0',
      data: product_details,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    common.selectAttributeFn(params)
  }
}