// 监听有关background,popups的信息
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'desc': {
      detailFn.fetchDesc = {
        has: true,
        ...request.data
      }
    }
      break
    default: {
    }
  }
  sendResponse('')
})

window.onload = function() {
  detailFn.init()
}

let category_id = ''
let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: true,
  first: true,
  fetchDesc: {
    has: false,
    description: '',
    images: []
  },
  userInfo: {},
  init() {
    let descItemNumber = $('#iid').attr('value') || $('#descItemNumber').text().trim() //获取ebay item number文本内容
    chrome.runtime.sendMessage(
      {
        //插件监听请求
        code: 'haveAdvt',
        message: 'success',
        data: {
          item_id: descItemNumber,
          platform: 'ebay'
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
  // 点击SFC按钮获取权限系统cookie做登录验证
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
    const _this = this
    // 强制切换语言为English（切换语言会刷新页面）
    const lang = $('.gh-menu #gh-eb-Geo-a-default').find('.gh-eb-Geo-txt').text()
    if (lang === '简体中文') {
      $('#sfc-collect-mask').attr('style', 'display:block')
      alert(
        '只支持采集英文站点下的产品，程序将自动切换到English环境，请等待页面加载完成重新点击采集按钮！'
      )
      await common.delay(1000)
      $('#gh-eb-Geo-a-en .gh-eb-Geo-txt').click()
      $('#sfc-collect-mask').attr('style', 'display:none')
      // $('#append_details').click()
      return
    } else {
      this.clickRun(common.productId)
      detailFn.isCollect = common.isCollect
    }

  },
  async clickRun(product_id) {
    let _this = this
    if (product_id) {
      if (!detailFn.isCollect) {
        chrome.runtime.sendMessage({
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
              $('#sfc-collect-mask').attr('style', 'display:block')
              _this.checkBtn(product_id)
            } else {
              alert(response.msg) //没有这个产品
              return
            }
            // 收到来自后台回复消息
          }
        )
      } else {
        $('#sfc-collect-mask').attr('style', 'display:block')
        _this.checkBtn(product_id)
      }
    } else {
      // alert('请点击采集按钮输入Istore Product ID')
      common.selectIdFrom() // 返回手动输入的ID字段和ID来源
      detailFn.is_manual_id = true
    }
  },
  checkBtn(product_id) {
    if (this.fetchDesc.has || !document.querySelector('#desc_ifr')) {
      const that = this
      $('body,html').scrollTop(0)
      $('html').animate({ scrollTop: 10000 }, 5000, () => {
          that.fetchCategory1(product_id)
          $('body,html').animate({ scrollTop: 0 }, 50)
        }
      )
    } else {
      setTimeout(() => {
        this.checkBtn(product_id)
      }, 100)
    }
  },
  async fetchProduct(product_id) {
    const attributes = await ebayLogic.fetchAttribute()
    const { brand, details } = ebayLogic.fetchDetail(this.fetchDesc)
    var obj = $('#itemTitle').clone()
    obj.find(':nth-child(n)').remove()
    let product_name = obj.text()
    const detail = {
      platform: 'ebay',
      site: 'fr',
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      site_domain: window.location.hostname,
      product_type: attributes.length > 1 ? 20 : 10,
      platform_url: window.location.href,
      product_name: product_name.trim(),
      main_image: ebayLogic.getMainImage(),
      brand: brand,
      category: ebayLogic.fetchCategory(),
      product_no: $('#iid').attr('value') || $('#descItemNumber').text().trim(),
      attributes,
      details: details,
      total_sales: Number($('.vi-txt-underline').text().trim().replace(/[^\d]/g, '')) || 0,
      shop: {
        shop_name: $('.si-sp-shop').text() || $('.mbg a[aria-label]').eq(0).text().trim(),
        shop_url: $('.si-sp-shop').find('a').attr('href') || $('.mbg a[aria-label]').eq(0).attr('href').replace(/(http:|https:)?(\/\/[a-zA-z0-9\-.]+)/g, 'https:$2')
      },
      user_id: this.userInfo.userId,
      user_name: this.userInfo.name,
      import_user: this.userInfo.username,
      source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”；
      keyword: document.referrer.indexOf('?') > -1 ? decodeURI(common.getRequest('?' + document.referrer.split('?')[1])._nkw || '').replace('+', ' ').replace('%2B', '+') : '',
      favorite: -1, // 收藏数
      month_sales: -1, // 月销量
      total_comment: -1, // 累积评论
      good_comment: -1, // 好评数
      comment_percent: -1 // 评分
    }
    detail.category.category_id = category_id
    // if ($('.cmptBrdr').length) {
    //   let compatibility = await ebayLogic.fetchCompatibility(0)
    //   if (compatibility.length > 0) {
    //     detail.compatibility = compatibility // 车库型信息字段少了 返回[] 为这时不要传这个参数给后台了
    //   }
    // }

    // 是否需要采集车型库
    if (detail.category.category_name.indexOf('Auto, moto') === 0) {
      detail.vehicle_accessories = ebayPureLogic.getVehicleUrls('EBAY-FR', detail.product_no)
    }
    console.log(detail)
    const params = {
      code: '0',
      data: detail,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    common.selectAttributeFn(params)
  },
  fetchCategory1(product_id) {
    const cat = {
      category_id: []
    }
    $('#vi-VR-brumb-lnkLst a').each((i, el) => {
      cat.category_id.push(el.href.slice(el.href.lastIndexOf('/') + 1))
    })
    this.replace(cat.category_id, cat.category_id.length - 1, product_id)
  },
  // 调接口查询是否存在这个目录，有才能保存成功
  replace(ids, n, product_id) {
    const that = this
    chrome.runtime.sendMessage({
        //插件监听请求
        code: 'checkedCategoryId',
        message: 'success',
        data: {
          site_code: 'us',
          category_id: ids[n]
        }
      },
      function(response) {
        if (response.type === 'timeout') {
          alert('请求目录接口超时，请稍后再试')
          $('#sfc-collect-mask').attr('style', 'display:none')
          return
        }
        if (response.code == 200) {
          category_id = ids[n]
          that.fetchProduct(product_id)
        }
        if (response.code != 200 && n >= 0) {
          n--
          that.replace(ids, n, product_id)
        }
        if (n < 0) {
          alert('验证ebay目录不存在，不采集此产品！')
          $('#sfc-collect-mask').attr('style', 'display:none')
          return
        }
      })
  }
}
