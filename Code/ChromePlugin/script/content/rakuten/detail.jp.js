chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'desc': {
      detailFn.fetchDesc = {
        ...request.data
      }
    }
      console.log('imagefafs', request)
      break
    default: {
    }
  }
  sendResponse('')
  console.log('eee', request)
})
window.onload = function() {
  detailFn.init()
}

let startTime = 0
const detailFn = {
  is_manual_id: false,
  fetchDesc: {
    images: []
  },
  isCollect: true,
  loading: null,
  user: {
    import_user: '0',
    product_id: ''
  },
  userInfo: {},
  init: function() {
    console.log('12412', detailFn.fetchDesc)
    /**
     * @description: 验证是否是shopee广告
     */
    const that = this
    const vendorItemId = location.pathname.split('/')[location.pathname.split('/').length - 2]
    chrome.runtime.sendMessage(
      {
        code: 'checkAdvt',
        message: 'success',
        data: {
          spu_id: [vendorItemId],
          platform: 'rakuten'
        }
      },
      function(response) {
        if (response.data.in.indexOf(descItemNumber) != -1) {
          //383485052707: true存在这个就不用采集
          $('#append_details').css('background-color', '#ccc')
          $('#append_details').css('pointer-events', 'none') //阻止用户的点击动作产生任何效
          return
        }
      }
    )
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
          this.clickIcon()
        } else {
          alert('登录校验失败，请使用权限系统账号登录插件（如已登录，请点击退出按钮重新登录）')
          return
        }
      }
    )
  },
  async clickIcon() {
    this.clickRun(common.productId)
    detailFn.isCollect = common.isCollect
  },
  async clickRun(product_id) {
    let that = this
    if (product_id != null && product_id != '') {
      if (!detailFn.isCollect) {
        $('#sfc-collect-mask').css('display', 'block')
        /**
         * @description: 验证是否是istore广告
         */
        chrome.runtime.sendMessage({
          code: 'haveProduct',
          message: 'success',
          data: {
            product_id: [product_id],
            method: 'istore.adv.getproductallinfo',
            es_local: 'US',
            platform: 'ebay'
          }
        }, function(response) {
          if (response.ack) {
            $('#sfc-collect-mask').attr('style', 'display:block')
            setTimeout(() => {
              that.getProductData(product_id)
            }, 500)
          } else {
            alert(response.msg) //没有这个产品
            $('#sfc-collect-mask').attr('style', 'display:none')
            return
          }
        })
      } else {
        $('#sfc-collect-mask').attr('style', 'display:block')
        setTimeout(() => {
          that.getProductData(product_id)
        }, 500)
      }
    } else {
      // alert('请点击采集按钮输入Istore Product ID')
      common.selectIdFrom() // 返回手动输入的ID字段和ID来源
      detailFn.is_manual_id = true
    }
  },
  async getProductData(product_id) {
    // try {
    $('#sfc-collect-mask').attr('style', 'display:block')
    const details = this.getDetails()
    const main_image = this.getProductImages()
    const attributes = await this.getSpecifics()
    const shop = this.getShop()
    const product_details = {
      platform: 'rakuten',
      site: 'jp',
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      product_name: $('.item_name').text(), // 标题
      product_type: attributes.length > 1 ? 20 : 10,  // 存在sku区分项即认为产品为varition
      product_no: window.location.href.slice(8).split('/')[2], // 产品id 根据url 取
      site_domain: window.location.host,
      category: rakutenLogic.fetchCategory(), // 分类目录
      main_image,
      brand: '', // 品牌
      month_sales: -1, // 月销量
      total_sales: -1, // 总销量
      favorite: -1, // 收藏数
      total_comment: -1, // 累积评论
      good_comment: -1, // 好评数
      comment_percent: -1, // 好评度
      details,
      shop,
      video: '',
      platform_url: window.location.href,
      is_check_brand: 0,
      // import_user: this.user.import_user,
      user_id: '',
      user_name: '',
      user_id: this.userInfo.userId,
      user_name: this.userInfo.name,
      import_user: this.userInfo.username || '0',
      source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”；
      keyword: document.referrer.includes('search') ? (decodeURIComponent(document.referrer.split('/')[document.referrer.split('/').length - 2]).replace(/\+/g, ' ') || '') : ''
    }
    // if (product_details.product_type === 10) {
    //   product_details.attr = this.getSpecifics()
    // } else {
    product_details.attributes = this.getSpecifics()
    // }
    const params = {
      code: '0',
      data: product_details,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    if (!params.data.shop.shop_name) {
      params.code = '2'
      params.message = '采集失败，无法获取店铺名称'
      alert('采集失败，无法获取店铺名称')
    } else if (!params.data.product_name) {
      params.code = '2'
      params.message = '采集失败，无法获取产品名称'
      alert('采集失败，无法获取产品名称')
    }
    console.log('========================product_details========================')
    console.log(params)
    $('#sfc-collect-mask').css('display', 'none')
    /**
     * @description: 属性选择
     */
    common.selectAttributeFn(params)
    // chrome.runtime.sendMessage(params, function (response) {
    //   $('#sfc-collect-mask').css('display', 'none')
    //   if (response === 'error') {
    //     alert('保存失败')
    //     return
    //   }
    //   // 收到来自后台回复消息
    //   if (response.message) {
    //     alert(response.message)
    //   }
    //   console.log(response)
    // })
    // } catch (err) {
    //   console.log(err)
    //   chrome.runtime.sendMessage({
    //       code: '2',
    //       message: '元素无法匹配',
    //       data: {
    //         platform: 'rakuten',
    //         platform_url: window.location.href
    //       }
    //     },
    //     function (response) {
    //       $('#sfc-collect-mask').attr('style', 'display:none')
    //       alert('采集失败')
    //     }
    //   )
    // }
  },
  getSpecifics: function() {
    let variation = $('.required_sku').length
    let attr
    if (variation) {
      attr = []
      let spec = []
      const spec_title = $('.required_sku').text().trim().split('×')
      const spec_row = Array.from($('.floating-cart-sku-table tr:first-child td'))
      if (spec_title.length > 1) {
        // 存在列区分项，行区分项截掉表头
        spec_row.splice(0, 1)
      }
      const spec_column = Array.from($('.floating-cart-sku-table tr td:first-child'))
      spec_column.splice(0, 1)
      let i = 0
      if (spec_row.length > spec_column.length && spec_column.length < 3) { // 如果列大于行,为列区分项
        let index = 0
        while (index < spec_row.length) {
          const v = $(spec_row[index]).text().trim()
          const obj = {
            specifics: [
              {
                key: spec_title[0],
                value: v
              }
            ]
          }
          Object.assign(obj, this.getProductPrice($(spec_row[index])))
          attr.push(obj)
          index++
        }
      } else { // 如果行大于列,为行区分项
        while (i < spec_row.length) {
          const v = $(spec_row[i]).text().trim()
          // 仅存在行区分项
          if (spec_title.length === 1) {
            const obj = {
              specifics: [
                {
                  key: spec_title[0],
                  value: v
                }
              ]
            }
            Object.assign(obj, this.getProductPrice())
            attr.push(obj)
          }
          let i1 = 0
          while (i1 < spec_column.length && spec_title.length !== 1) {
            const v1 = $(spec_column[i1]).text().trim()
            const obj = {
              specifics: [
                {
                  key: spec_title[0],
                  value: v
                },
                {
                  key: spec_title[1],
                  value: v1
                }
              ]
            }
            Object.assign(obj, this.getProductPrice($(spec_column[i1])))
            attr.push(obj)
            i1++
          }
          i++
        }
      }
    } else {
      // attr = { price: this.getProductPrice() }
      let isSelect = false
      $('.skuSelDrop option').each((index, element) => {
        if ($(element).context.text === '-') {
          isSelect = true
        }
      })
      if ($('.skuSelDrop option').length > 2 && isSelect) { // 下拉框
        attr = []
        let options = document.querySelectorAll('.skuSelDrop option')
        let optionList = []
        options.forEach(e => {
          optionList.push(e.childNodes[0].nodeValue)
        })
        let newOptionList = optionList.slice(2)
        let choiceText = document.querySelectorAll('.choiceText')
        let choiceTextList = []
        choiceText.forEach(e => {
          choiceTextList.push(e.childNodes[0].nodeValue)
        })
        let newChoiceTextList = choiceTextList.slice(1)
        let i2 = 0
        while (i2 < newOptionList.length && newChoiceTextList.length !== 0) {
          const v2 = newOptionList[i2]
          const obj2 = {
            specifics: [
              {
                key: newChoiceTextList[0],
                value: v2
              }
            ]
          }
          Object.assign(obj2, this.getProductPrice())
          attr.push(obj2)
          i2++
        }
      } else {
        attr = []
        attr.push(this.getProductPrice())
      }
    }
    // if (Array.isArray(attr)) {
    //   for (let j = 0; j < attr.length; j++) {
    //     for (let k = attr.length; k > j; k--) {
    //       if (JSON.stringify(attr[j]) === JSON.stringify(attr[k])) {
    //         attr.splice(k, 1)
    //       }
    //     }
    //   }
    // }
    return attr
  },
  getProductPrice(item) {
    let imgList = Array.from(item ? item.find('span') : [])
    let hasImg = false
    imgList.forEach((e, i) => {
      hasImg = window.getComputedStyle(e, '::before').getPropertyValue('background-image').includes('jpg')
    })
    return {
      price: {
        selling_price: document.querySelectorAll('span.price2')[0].getAttribute('content') ? Number(document.querySelectorAll('span.price2')[0].getAttribute('content')) : '0.00',
        original_price: document.querySelectorAll('span.double_price')[0] && document.querySelectorAll('span.double_price')[0].getAttribute('content') ? Number(document.querySelectorAll('span.double_price')[0].getAttribute('content')) : '0.00'
        // spike_price: 0.00,
        // member_price: 0.00,
        // promotion_price: 0.00,
        // flash_price: 0.00,
        // happy_price: 0.00,
      },
      stock_num: 0, // 库存
      product_weight: '', // 找不到不取
      packing: '', // 找不到不取
      // images: this.getPriceImages()[item].toString().split('"')[1],
      images: item && hasImg ? this.getPriceImages(item).split(',') : [],
      product_no: window.location.href.slice(8).split('/')[2] // 产品id 找不到留空
    }
  },
  // 获取区分项图片
  getPriceImages(item) {
    // const imgDom = $('.floating-cart-sku-table .inventory_choice_name span')
    // let imgList = document.querySelectorAll('.floating-cart-sku-table .inventory_choice_name span')
    if (item) {
      let imgList = Array.from(item.find('span'))
      let imgUrl = []
      imgList.forEach((e, i) => {
        let hasImg = window.getComputedStyle(e, '::before').getPropertyValue('background-image').includes('jpg')
        if (hasImg) {
          imgUrl.push(window.getComputedStyle(e, '::before').getPropertyValue('background-image'))
        }
      })
      // imgUrl = imgUrl.map(e => e.replace(/.*?\(\"(.+?)\"\)\".*?/, '$1'))
      if (imgUrl.length !== 0) {
        return imgUrl.toString().split('"')[1]
      } else {
        return imgUrl = []
      }
    } else {
      return imgUrl = []
    }
  },
  getDetails() {
    const desc = $('.item_desc').html() || ''
    // const images = Array.from($('.sale_desc img')).map(v => $(v).attr('src')).filter(v => v)
    let imgSale = Array.from($('.sale_desc img'))
    let imgItem = Array.from($('.item_desc img'))
    const images = imgSale.length === 0 ? imgItem.map(v => $(v).attr('src').includes('http') ? $(v).attr('src') : `https://image.rakuten.co.jp/${ $(v).attr('src') }`) : imgSale.map(v => $(v)
      .attr('src')
      .includes('http') ? $(v).attr('src') : `https://image.rakuten.co.jp/${ $(v).attr('src') }`)
    const obj = {
      params: [],
      images: this.fetchDesc.images.length === 0 ? images : this.fetchDesc.images,
      description: common.formatScript(desc.replace(/\n/g, '<br>').replace(/\t/g, '').replace(/\"/g, '\'')),
      packing: ''
    }
    console.log('obj', obj)
    return obj
  },
  // 获取main图片
  getProductImages() {
    const that = this
    const imgArr = []
    const imgDom = Array.from($('.rakutenLimitedId_ImageMain1-3'))
    imgDom.forEach(item => {
      imgArr.push(that.formatSrc($(item).find('img').attr('src')))
    })
    let imgArray = imgArr.filter(function(e) {
      return e && e.trim()
    })
    return imgArray
  },
  getShop() {
    return {
      shop_name: window.location.href.slice(8).split('/')[1],
      shop_url: `https://www.rakuten.ne.jp/gold/${ window.location.href.slice(8).split('/')[1] }/`
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
  }
}