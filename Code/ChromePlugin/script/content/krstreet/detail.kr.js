window.addEventListener('DOMContentLoaded', function() {
  /* 异常情况按钮不可操作 */
  common.forbiddenIcon()
})
window.onload = function() {
  $('#append_details').removeClass('spider-color-forbidden')
  detailFn.init()
}

const url = window.location.href
let t = null
let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: true,
  // 用户
  user: {
    code: '',
    import_user: '',
    product_id: ''
  },
  userInfo: {},
  init() {
    const that = this
    const product_no = Kr11streetLogic.getProductNo()
    if (common.currentUrl.includes(url) || url.indexOf('search') === -1 || url.indexOf('shop') === -1) {
      if (!Number.isNaN(Number(product_no))) {
        chrome.runtime.sendMessage({
          //插件监听请求
          code: 'checkAdvt',
          message: 'success',
          data: {
            spu_id: [product_no],
            platform: 'kr11street'
          }
        }, function(response) {
          if (response.data[product_no]) {
            $('#append_details').css('background-color', '#ccc')
            $('#append_details').css('pointer-events', 'none') //阻止用户的点击动作产生任何效
            $('#append_details').css('cursor', 'not-allowed')
            alert('自己平台广告不采集')
            return
          }
        })
      }
      if ($('#append_details').length) {
        document.body.scrollTop = 0
        let panel = $('.spider-append-icon')
        // panel.removeClass('spider-color-forbidden')
        panel.attr('title', '点击获取竞品数据')
        panel.unbind('click').on('click', function() {
          startTime = new Date().getTime()
          that.checkVersion()
        })
      } else {
        that.init()
      }
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
    chrome.runtime.sendMessage({
      code: 'checkVersion',
      message: 'success',
      data: ''
    }, response => {
      if (response === 'later') {
        alert('版本已过期，请下载最新版本')
        window.open(`http://xian.suntekcorps.com:8825/help/spider`)
      } else {
        that.login()
      }
    })
  },
  async clickIcon() {
    $('#sfc-collect-mask').css('display', 'none')
    this.clickRun(common.productId)
    detailFn.isCollect = common.isCollect
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
              product_id: [product_id],
              method: 'istore.adv.getproductallinfo',
              es_local: 'US',
              platform: 'ebay'
            }
          },
          function(response) {
            $('#sfc-collect-mask').attr('style', 'display:none')
            if (response.ack) {
              $('#sfc-collect-mask').attr('style', 'display:block')
              setTimeout(() => {
                that.getPageDetails(product_id)
              }, 500)
            } else {
              alert(response.msg) //没有这个产品
              $('#sfc-collect-mask').attr('style', 'display:none')
            }
            // that.getPageDetails(product_id)
          }
        )
      } else {
        $('#sfc-collect-mask').attr(
          'style',
          'display:block'
        )
        $('body,html').scrollTop(0)
        $('html').animate({
          scrollTop: 10000
        }, 5000, () => {
          that.getPageDetails(product_id)
          $('body,html').animate({ scrollTop: 0 }, 50)
        })
      }
    } else {
      // alert('请点击采集按钮输入Istore Product ID')
      common.selectIdFrom() // 返回手动输入的ID字段和ID来源
      detailFn.is_manual_id = true
    }
  },
  // 采集信息
  async getPageDetails(product_id) {
    const { details, brand } = Kr11streetLogic.fetchDetails()
    const collection_sku_id = common.getRequest().collection_sku_id
    const product_name = Kr11streetLogic.getProductName()
    const product_no = Kr11streetLogic.getProductNo()
    const favorite = Kr11streetLogic.getFavorite()
    const category = Kr11streetLogic.fetchCategory()
    const { main_image, video } = Kr11streetLogic.fetchMainImage()
    const shop = Kr11streetLogic.fetchShop()
    const { total_comment, good_comment } = Kr11streetLogic.getComment()
    const comment_percent = 0
    const month_sales = 0
    const total_sales = 0
    let attributes = await Kr11streetLogic.getSpecifics()
    // if (document.querySelector('#ui_option1')) {
    //   attributes = await Kr11streetLogic.fetchAttribute()
    // } else {
    //   attributes = [{
    //     specifics: {},
    //     product_no,
    //     price: {
    //       selling_price: $( '#prdcInfoColumn2 .sale_price' ).text() || '',
    //       original_price: $( '#prdcInfoColumn2 .normal_price' ).text() || ''
    //     },
    //     stock_num: $( '.soldout' ).text().trim() ? $( '.soldout' ).text().trim().replace( /\D/g, '' ) : ''
    //   }]
    // }
    const detail = {
      platform: 'kr11street',
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      site_domain: window.location.hostname,
      site: 'kr',
      product_name, // 标题
      product_type: attributes.length > 1 ? 20 : 10, // very为20 单品为10
      product_no, // amazon中ASIN即为产品id
      category, // 目录ID
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
      source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”;
      keyword: location.href.indexOf('?') > -1 ? decodeURI(decodeURI(common.getRequest().kwd || '')) : ''
    }

    const params = {
      code: '0',
      data: detail,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    console.log('========================product_details========================')
    console.log(params)
    /**
     * @description: 属性选择
     */
    common.selectAttributeFn(params)
  }
}