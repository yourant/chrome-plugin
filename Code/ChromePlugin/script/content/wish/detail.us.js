window.onload = function() {
  detailFn.init()
}

let userCode = ''
let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: true,
  userInfo: {},
  init: function() {
    const that = this
    /**
     * @description: 检测wish广告
     */
    const proNo = location.pathname.split('/').pop()
    chrome.runtime.sendMessage({
      code: 'checkedAdvt',
      message: 'success',
      data: {
        platform: 'wish',
        method: 'istore.adv.productisistoreadvt',
        advt_id: [proNo]
      }
    }, function(response) {
      if (response.data[proNo]) {
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
              this.fetchProduct(product_id)
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
    $('#sfc-collect-mask').attr('style', 'display:block')
    const details = this.getDetails()
    const main_image = this.getProductImages()
    const attributes = await this.getSpecifics()
    const shop = await this.getShop()
    const product_details = {
      platform: 'wish',
      site: 'us',
      product_name: $('.PurchaseContainer__Name-sc-1qlezk8-3').text(), // 标题
      product_type: attributes.length > 1 ? 20 : 10,
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      site_domain: window.location.hostname,
      product_no: location.pathname.split('/').pop(), // 产品id 根据url 取
      category: {
        category_id: '',
        category_tree: [],
        category_name: ''
      }, // 分类目录
      main_image,
      brand: '', // 品牌
      month_sales: -1, // 月销量
      total_sales: -1, // 总销量
      favorite: -1, // 收藏数
      total_comment: $('.PurchaseContainer__RatingCount-sc-1qlezk8-5').length ? $('.PurchaseContainer__RatingCount-sc-1qlezk8-5').text().replace(/[^0-9]/g, '') : '', // 累积评论
      good_comment: -1, // 好评数
      comment_percent: -1, // 好评度
      attributes,
      details,
      shop,
      video: '',
      platform_url: window.location.href,
      user_id: this.userInfo.userId,
      user_name: this.userInfo.name,
      import_user: this.userInfo.username,
      source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”；
      keyword: location.href.indexOf('search') !== -1 ? location.href.split('/')[4] : ''
    }
    console.log(product_details)

    const params = {
      code: '0',
      data: product_details,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    if (!params.data.shop.shop_name) {
      params.code = '2'
      params.message = '采集失败，无法获取店铺名称,请确保页面加载完成后再采集'
      alert('采集失败，无法获取店铺名称')
    } else if (!params.data.product_name) {
      params.code = '2'
      params.message = '采集失败，无法获取产品名称'
      alert('采集失败，无法获取产品名称')
    }
    console.log('=======================采集数据===========================')
    console.log(params)
    /**
     * @description: 属性选择
     */
    common.selectAttributeFn(params)
  },
  getSpecifics: async function() {
    const arr = []
    const list1 = $('.DimensionSection__DimensionWrapper-sc-1sp8lqj-0').eq(0).find('.WishSelectInput__SelectBoxDropdown-sc-1hxkg4o-3 > div')
    const list1Key = $('.DimensionSection__DimensionWrapper-sc-1sp8lqj-0').eq(0).find('.DimensionSection__DimensionType-sc-1sp8lqj-6').text()
    const list2 = $('.DimensionSection__DimensionWrapper-sc-1sp8lqj-0').eq(1).find('.WishSelectInput__SelectBoxDropdown-sc-1hxkg4o-3 > div')
    const list2Key = $('.DimensionSection__DimensionWrapper-sc-1sp8lqj-0').eq(1).find('.DimensionSection__DimensionType-sc-1sp8lqj-6').text()
    const list3 = $('.DimensionSection__DimensionWrapper-sc-1sp8lqj-0').eq(2).find('.WishSelectInput__SelectBoxDropdown-sc-1hxkg4o-3 > div')
    const list3Key = $('.DimensionSection__DimensionWrapper-sc-1sp8lqj-0').eq(2).find('.DimensionSection__DimensionType-sc-1sp8lqj-6').text()
    // 获取数据 list1、list2、list3 为暂认为有4个属性可点、逻辑相同、循环写较为困难、、日后优化
    let i = 0
    while (i < list1.length) {
      const v = list1.eq(i)
      $(v).click()
      await this.delay(200)
      // 如果只有第一层就直接添加数据
      if (!list2.length) {
        const obj = {
          specifics: [
            {
              key: list1Key.replace(/:/g, ''),
              value: $(v).find('.DimensionSection__DimensionText-sc-1sp8lqj-3').text()
            }
          ]
        }
        Object.assign(obj, this.getProductPrice())
        arr.push(obj)
      }
      let i1 = 0
      while (i1 < list2.length) {
        const v1 = list2.eq(i1)
        $(v1).click()
        await this.delay(200)
        if (!list3.length) {
          const obj = {
            specifics: [
              {
                key: list1Key.replace(/:/g, ''),
                value: $(v).find('.DimensionSection__DimensionText-sc-1sp8lqj-3').text()
              },
              {
                key: list2Key.replace(/:/g, ''),
                value: $(v1).find('.DimensionSection__DimensionText-sc-1sp8lqj-3').text()
              }
            ]
          }
          Object.assign(obj, this.getProductPrice())
          arr.push(obj)
        }
        let i2 = 0
        while (i2 < list3.length) {
          const v2 = list3.eq(i2)
          $(v2).click()
          await this.delay(200)
          const obj = {
            specifics: [
              {
                key: list1Key.replace(/:/g, ''),
                value: $(v).find('.DimensionSection__DimensionText-sc-1sp8lqj-3').text()
              },
              {
                key: list2Key.replace(/:/g, ''),
                value: $(v1).find('.DimensionSection__DimensionText-sc-1sp8lqj-3').text()
              },
              {
                key: list3Key.replace(/:/g, ''),
                value: $(v2).find('.DimensionSection__DimensionText-sc-1sp8lqj-3').text()
              }
            ]
          }
          Object.assign(obj, this.getProductPrice())
          arr.push(obj)
          i2++
        }
        i1++
      }
      i++
    }
    if (!arr.length) {
      arr.push(this.getProductPrice(location.pathname.split('/').pop()))
    }
    return arr
  },
  getProductPrice() {
    const obj = {
      shipping: {
        start_arrivals: '',
        delivery: $('.ProductShippingContainer__ShippingPrice-sc-8ja2bt-5').text(), // 运输方式,
        delivery_time: ''
      },
      price: {
        selling_price: $('.PurchaseContainer__ActualPrice-sc-1qlezk8-9').text() || '0.00',
        original_price: $('.PurchaseContainer__CrossedPrice-sc-1qlezk8-10').text() || '0.00'
        // spike_price: '0.00',
        // member_price: '0.00',
        // promotion_price: '0.00',
        // flash_price: '0.00',
        // happy_price: '0.00'
      },
      stock_num: '', // 库存
      product_weight: '', // 找不到不取
      packing: '', // 找不到不取
      images: [],
      product_no: location.pathname.split('/').pop()
    }
    if ($('.BuyButton__Button-z0grbs-0 BuyButton__Soldout-z0grbs-2').length) {
      obj.stock_num = '0'
    } else if ($('.PurchaseContainer__LowInventoryText-sc-1qlezk8-12').length) {
      obj.stock_num = $('.PurchaseContainer__LowInventoryText-sc-1qlezk8-12').text().replace(/[^0-9]/g, '')
    }
    if (!obj.price.selling_price && obj.price.original_price) {
      obj.price.selling_price = obj.price.original_price
      obj.price.original_price = ''
    }
    return obj
  },
  getDetails() {
    const desc = $('.ProductDescriptionContainer__DescriptionContainer-mzj20l-5').html().replace(/[\n↵\r]+/g, '').replace(/\s+/g, ' ')
    const obj = {
      params: [],
      images: [],
      description: desc ? desc.replace(/\n+/g, '').replace(/\t/g, '').replace(/\"/g, '\'').replace(
        /(https:|http:)?(\/\/[A-Za-z0-9\-.\/]*\.(jpg|jpeg|gif|png))/g,
        'https:$2'
      ).replace(/(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)|(?<=<a\s*.*href=')[^']*(?=')/gi, 'javascript:;').replace(/(<br>){2,}|(<br\/>){2,}/, '<br>') : '',
      packing: ''
    }
    return obj
  },
  // 获取产品图片
  getProductImages() {
    const arr = []
    $('.ProductImageContainer__StripImages-s90bs8-4 img').each((i, v) => {
      if (i === 0) {
        arr.push(this.formatSrc($(v).attr('src')))
      } else {
        arr.push(this.formatSrc($(v).attr('src').replace(/small/g, 'big')))
      }
    })
    return arr
  },
  async getShop() {
    $('.StoreReviewContainer__DetailText-nnaxen-3').click()
    await this.delay(1000)
    setTimeout(() => {
      $('.BaseModal__CloseButton-sc-188teto-3').click()
    })
    let shop_url = ''
    if ($('.ReviewSection__VisitStore-sc-1gaf76d-5').attr('href')) {
      shop_url = location.origin + $('.ReviewSection__VisitStore-sc-1gaf76d-5').attr('href')
    }
    if ($('.StoreReviewContainer__StoreNameLink-nnaxen-9').attr('href')) {
      shop_url = location.origin + $('.StoreReviewContainer__StoreNameLink-nnaxen-9').attr('href')
    }
    return {
      shop_name: $('.StoreReviewContainer__StoreName-nnaxen-8').text() || $('.StoreReviewContainer__StoreNameLink-nnaxen-9').text(), // 店名,
      shop_start: '',
      user_rating: $('.StoreReviewContainer__StoreRatingScore-nnaxen-10').text(),
      rating_user_num: $('.StoreReviewContainer__StoreTotalRating-nnaxen-11').text().replace(/[^0-9]/g, ''),
      after_service: '',
      customer_service: '',
      logistics: '',
      violation: '',
      shop_url: shop_url,
      description: ''
    }
  },
  delay: function(num) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, num)
    })
  },
  // 获取url中参数对象
  getRequest: () => {
    const url = location.search
    const theRequest = {}
    if (url.indexOf('?') !== -1) {
      const str = url.substr(1)
      const strs = str.split('&')
      for (var i = 0; i < strs.length; i++) {
        theRequest[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
      }
    }
    return theRequest
  },
  // 转换图片 http
  formatSrc: (src) => {
    return src && src.replace(/^(https:|http:)?(\/\/)/, 'https:$2') || ''
  },
  formatBigImage: (id) => {
    return `https://contestimg.wish.com/api/image/fetch?contest_id=${ id }&s=0&q=80`
  }
}