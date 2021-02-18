window.onload = function() {
  detailFn.init()
}

let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: false,
  loading: null,
  images: [],
  baseObj: {},
  userInfo: {},
  init: function() {
    /**
     * @description: 检测coupang广告
     */
    const that = this
    const vendorItemId = location.pathname.split('/')[location.pathname.split('/').length - 1]
    chrome.runtime.sendMessage({
      code: 'checkAdvt',
      message: 'success',
      data: {
        spu_id: [vendorItemId],
        platform: 'coupang'
      }
    }, function(response) {
      if (response.data[vendorItemId]) {
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
      panel.unbind('click').on('click', () => {
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
    location.href = 'javascript:document.body.setAttribute(\'data-sdp\', JSON.stringify(sdp));'
    const getData = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(JSON.parse(document.body.getAttribute('data-sdp')))
        })
      })
    }
    this.baseObj = await getData()
    this.images = this.getProductImages()
    try {
      $('#sfc-collect-mask').attr('style', 'display:block')
      $('body,html').animate({
        'scrollTop': 5000
      }, 3000)
      await common.delay(3000)
      $('body,html').animate({
        'scrollTop': 0
      }, 0)
      const details = this.getDetails()
      const attributes = await this.getSpecifics()
      const category = this.getCategory()
      const shop = this.getShop()
      const total_comment = $('.product-tab-review-count').text().replace(/[^0-9]/g, '') || 0
      const good_comment = $('.sdp-review__article__order__star__all__current:last-child').find('.sdp-review__article__order__star__all__current__count').text().replace(/[^\d]/g, '') || 0
      this.images = [...new Set(this.images)].filter(v => v.match(/(png|jpg|jpeg|gif)/))
      const product_details = {
        platform: 'coupang',
        site: 'kr',
        site_domain: window.location.hostname,
        istore_product_id: detailFn.isCollect ? product_id : 0,
        collection_sku_id: detailFn.isCollect ? 0 : product_id,
        product_name: this.baseObj['title'], // 标题
        product_type: attributes.length > 1 ? 20 : 10,
        product_no: location.pathname.split('/')[location.pathname.split('/').length - 1],
        category, // 分类目录
        main_image: this.images,
        brand: this.baseObj['brand'] || '', // 品牌
        month_sales: -1, // 月销量
        total_sales: -1, // 总销量
        favorite: -1, // 收藏数
        total_comment, // 累积评论
        good_comment, // 好评数
        comment_percent: $('.rating-star-num').attr('style').replace(/[^\d]/g, '') / 200, // 好评度 列如：宽度90.0% 留下数字 / 200 = 4.5颗星
        attributes,
        details,
        shop,
        video: '',
        platform_url: window.location.href,
        user_id: this.userInfo.userId,
        user_name: this.userInfo.name,
        import_user: this.userInfo.username,
        source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”；
        keyword: document.referrer.indexOf('search') !== -1 ? decodeURI((common.getRequest('?' + document.referrer.split('?')[1]).q) || '') : ''
      }
      const params = {
        code: '0',
        data: product_details,
        startTime,
        is_manual_id: detailFn.is_manual_id
      }
      console.log('==========================product_details=========================================')
      console.log(product_details)
      common.selectAttributeFn(params)
      //   console.log(product_details)
      //   chrome.runtime.sendMessage(params, function (response) {
      //     $('#sfc-collect-mask').css('display', 'none')
      //     if (response === 'error') {
      //       alert('保存失败')
      //       return
      //     }
      //     // 收到来自后台回复消息
      //     if (response.message) {
      //       alert(response.message)
      //     }
      //     console.log(response)
      //   })
    } catch (err) {
      console.log(err)
      //   console.log(err)
      chrome.runtime.sendMessage({
          code: '2',
          message: '元素无法匹配',
          data: {
            platform: 'wish',
            platform_url: window.location.href
          }
        },
        function(response) {
          $('#sfc-collect-mask').attr('style', 'display:none')
          alert('采集失败')
        }
      )
    }
  },
  getCategory() {
    const obj = {
      category_id: '',
      category_tree: [],
      category_name: []
    }
    $('#breadcrumb li').each((i, v) => {
      const href = $(v).find('a').attr('href')
      if (href !== '/') {
        obj.category_tree.push(href.replace(/\/np\/categories\/(\d+).*/g, '$1'))
        obj.category_name.push($(v).find('a').text().trim())
      }
    })
    obj.category_id = obj.category_tree[obj.category_tree.length - 1]
    obj.category_name = obj.category_name.join('>')
    return obj
  },
  getSpecifics() {
    let specificsList = []
    if (this.baseObj.options) {
      let itemMap = this.baseObj.options.attributeVendorItemMap
      for (let key in itemMap) {
        specificsList.push(this.createSpecValue(itemMap[key], key))
      }
      specificsList.forEach(v => {
        this.baseObj.options.optionRows.forEach(v1 => {
          v1.attributes.forEach(v2 => {
            if (v.idMap.includes(v2.valueId)) {
              v.specifics.push({ key: v1.name, value: v2.name })
              if (v2.image) {
                v.images = [common.formatSrc(v2.image.thumbnailImage.replace('48x48ex', '960x960ex'))]
              }
            }
          })
        })
        delete v.idMap
      })
    }
    if (specificsList.length === 0) {
      specificsList = [
        {
          price: this.getPrice(),
          shipping: this.getShipping(this.baseObj),
          stock_num: '',
          product_weight: 0,
          packing: '',
          images: [],
          product_no: this.baseObj['productId'] + ''
        }]
    }
    return specificsList
  },
  createSpecValue(item, key) {
    this.images = this.images.concat(item.images.map(v => common.formatSrc(v.thumbnailImage.replace('48x48ex', '960x960ex'))))
    const obj = {
      idMap: key.split(':'),
      specifics: [],
      price: this.getPrice(item),
      shipping: this.getShipping(item),
      stock_num: '',
      product_weight: 0,
      packing: '',
      images: [],
      product_no: item['vendorItemId'] + ''
    }
    return obj
  },
  getPrice(item) {
    let selling_price, original_price, member_price
    if (item) {
      selling_price = item.quantityBase[0]['price']['salePrice']
      original_price = item.quantityBase[0]['price']['originPrice']
      member_price = item.quantityBase[0]['price']['couponPrice']
    } else {
      selling_price = this.baseObj.quantityBase[0]['price']['salePrice']
      original_price = this.baseObj.quantityBase[0]['price']['originPrice']
      member_price = this.baseObj.quantityBase[0]['price']['couponPrice']
    }
    if (!selling_price && member_price) {
      selling_price = member_price.replace(',', '')
      member_price = '0.00'
    }
    if (!selling_price && original_price) {
      selling_price = original_price.replace(',', '')
      original_price = '0.00'
    }
    selling_price = selling_price ? selling_price.replace(',', '') : '0.00'
    original_price = original_price ? original_price.replace(',', '') : '0.00'
    member_price = member_price ? member_price.replace(',', '') : '0.00'
    return {
      selling_price,
      original_price,
      // spike_price: '0.00',
      member_price
      // promotion_price: '0.00',
      // flash_price: '0.00',
      // happy_price: '0.00'
    }
  },
  getShipping(item) {
    return {
      start_arrivals: '',
      delivery: $(item['quantityBase'][0]['shippingFee']['message']).text() || item['quantityBase'][0]['shippingFee']['message'],
      delivery_time: ''
    }
  },
  getDetails() {
    let desc = $('.detail-item').html()
    desc = desc.replace(/\n/g, '<br>').replace(/\t/g, '').replace(/\"/g, '\'').replace(
      /(https:|http:)?(\/\/[A-Za-z0-9\-.\/]*\.(jpg|jpeg|gif|png))/g,
      'https:$2'
    )
    const obj = {
      params: Array.from($('.product-item__table').eq(0).find('.prod-delivery-return-policy-table th')).map(v => {
        return {
          key: $(v).text().trim() || '',
          value: $(v).next().text().trim() || ''
        }
      }),
      images: Array.from($('.detail-item').find('img')).filter(v => $(v).attr('src')).map(v => this.formatSrc($(v).attr('src'))),
      description: common.formatScript(desc),
      packing: ''
    }
    return obj
  },
  // 获取产品图片
  getProductImages() {
    const arr = []
    $('.prod-image__item img').each((i, v) => {
      arr.push(this.formatSrc($(v).attr('src').replace('48x48ex', '960x960ex')))
    })
    return arr
  },
  getShop() {
    return {
      shop_name: $('.prod-sale-vendor a font').text().trim() || $('.prod-sale-vendor a').text().trim() || '', // 店名,
      shop_start: '',
      user_rating: '',
      rating_user_num: '',
      after_service: '',
      customer_service: '',
      logistics: '',
      violation: '',
      shop_url: $('.prod-sale-vendor a').attr('href') && location.origin + $('.prod-sale-vendor a').attr('href')
        || '',
      description: ''
    }
  },
  // 转换图片 http
  formatSrc: (src) => {
    return src && src.replace(/^(https:|http:)?(\/\/)/, 'https:$2') || ''
  }
}