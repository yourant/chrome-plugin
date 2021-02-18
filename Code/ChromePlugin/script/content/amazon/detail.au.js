const url = window.location.href

function domLoaded() {
  $('#append_details').removeClass('spider-color-forbidden')
  common.forbiddenIcon()
  detailFn.init()
}

window.addEventListener('DOMContentLoaded', domLoaded)
let userCode = ''
let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: true,
  main_image: [],
  userInfo: {},
  // product_no: $("#ASIN") ? $("#ASIN").val() : $('#acBadge_feature_div script') ? JSON.parse($('#acBadge_feature_div script').text()).acAsin : '',
  init() {
    const category = AmazonLogic.fetchCategory()
    if (category.is_details && !category.category_tree.length) {
      window.location.href = window.location.href
    }
    let descItemNumber = $('#ASIN').val() //获取eBay item number文本内容
    chrome.runtime.sendMessage(
      {
        //插件监听请求
        code: 'haveAdvt',
        message: 'success',
        data: {
          item_id: descItemNumber,
          platform: 'amazon'
        }
      },
      function(response) {
        if (response.data.in.indexOf(descItemNumber) != -1) {
          //383485052707: true存在这个就不用采集
          $('#append_details').css('background-color', '#ccc')
          $('#append_details').css('pointer-events', 'none') //阻止用户的点击动作产生任何效
          alert('自己平台广告不采集')
          return
        }
      }
    )

    if ($('#append_details').length) {
      document.body.scrollTop = 0
      let panel = $('.spider-append-icon')
      // panel.removeClass('spider-color-forbidden')
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
          this.clickIcon()
        } else {
          // 未登录
          // window.open('http://account.suntekcorps.com:8080/')
          alert('登录校验失败，请使用权限系统账号登录插件（如已登录，请点击退出按钮重新登录）')
          return
        }
      }
    )
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
    let that = this
    // const lang = $('#icp-nav-flyout span>span>span').eq(1).text().trim()
    const lang = common.getCookie('lc-main')
    if (lang && lang !== 'en_US') {
      alert('只支持采集英文站点下的产品，程序将自动切换到English环境，请等待页面加载完成重新点击采集按钮！')
      common.setCookie('lc-main', 'en_US', 365, '.amazon.com.au')
      location.reload()
      return
    } else {
      this.clickRun(common.productId)
      detailFn.isCollect = common.isCollect
    }
  },
  async clickRun(product_id) {
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
              AmazonLogic.initSpecifics()
              $('html').animate({
                scrollTop: 10000
              }, 2000, () => {
                that.getPageDetails(product_id)
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
        AmazonLogic.initSpecifics()
        $('html').animate({
          scrollTop: 10000
        }, 2000, () => {
          that.getPageDetails(product_id)
          $('body,html').animate({ scrollTop: 0 }, 50)
        })
      }
      // $('#sfc-collect-mask').css('display', 'block')
    } else {
      // alert('请点击采集按钮输入Istore Product ID')
      common.selectIdFrom() // 返回手动输入的ID字段和ID来源
      detailFn.is_manual_id = true
    }
  },

  /**
   * @description:获取详情信息
   * */

  async getPageDetails(product_id) {
    let result = {
      code: '0',
      data: {}
    }
    /* 区分项element */
    await common.delay(1000)
    const details = await AmazonLogic.getDetails()
    const shop = AmazonLogic.getShopInfo()
    const brand = AmazonLogic.getBrand()
    const video = AmazonLogic.getVideo()
    const putaway_time = AmazonLogic.getPutawayTime()
    const product_no = AmazonLogic.getProductNo()
    const product_name = AmazonLogic.getProductName()
    const category = AmazonLogic.fetchCategory()
    const { total_sales, total_comment, good_comment, comment_percent } = await AmazonLogic.getEvaluation()
    const attributes = await AmazonLogic.getSpecifics()
    const main_image = []
    const month_sales = -1
    const favorite = -1

    const product_details = {
      platform: 'amazon',
      site: 'au',
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      site_domain: window.location.hostname,
      product_name: $('#productTitle').text().trim(), // 标题
      product_type: 10, // very为20 单品为10
      product_no, // amazon中ASIN即为产品id
      category, // 目录ID
      putaway_time, // 上架时间(新增字段)
      main_image,
      brand, // 品牌
      month_sales, // 月销量
      total_sales, // 总销量
      favorite, // 收藏数
      total_comment, // 累计评论
      good_comment, // 好评数
      comment_percent, // 好评度
      attributes,  // 属性区分项
      details, // 详情
      shop,  // 店铺信息
      video,
      platform_url: url, // 详情地址
      user_id: this.userInfo.userId,
      user_name: this.userInfo.name,
      import_user: this.userInfo.username,
      source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”；
      keyword: (url.indexOf('?') > -1 ? decodeURIComponent(common.getRequest('?' + url.split('?')[1]).keywords || '') : '').replace(/\+/g, ' ')
    }

    /* 合并重组数据 */
    Object.assign(result.data, product_details)
    console.log('======================================product_details===========================')
    console.log(result)
    const params = {
      code: '0',
      data: product_details,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    common.selectAttributeFn(params)
  }
}