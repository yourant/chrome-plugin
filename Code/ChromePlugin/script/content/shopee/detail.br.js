// const port = chrome.runtime.connect({
//   name: "shopee"
// }) //通道名称
// port.onMessage.addListener(function (msg) { //监听消息
//   if (msg.type === 4) {
//     alert(msg.msg)
//     $('#sfc-collect-mask').css('display', 'none')
//     $('#append_details').css('background-color', '#ccc')
//     $('#append_details').css('pointer-events', 'none')
//     $('#append_details').css('cursor', 'not-allowed')
//   } else {
//     if (!msg) {
//       alert('该产品为iStore产品, 不可采集')
//       $('#sfc-collect-mask').css('display', 'none')
//       $('#append_details').css('background-color', '#ccc')
//       $('#append_details').css('pointer-events', 'none')
//       $('#append_details').css('cursor', 'not-allowed')
//     }
//   }
// })

window.addEventListener('DOMContentLoaded', function() {
  /* 异常情况按钮不可操作 */
  common.forbiddenIcon()
})
const url = window.location.href
window.onload = function() {
  /* 设置默认语言为English */
  common.setCookie('language', 'en', 1000, window.location.host.replace(/www./g, ''))
  $('#append_details').removeClass('spider-color-forbidden')
  detailFn.init()
}

let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: true,
  user: {
    import_user: '',
    product_id: ''
  },
  userInfo: {},
  form_id: common.getRequest().from_id,
  collection_sku_id: common.getRequest().collection_sku_id,
  init() {
    const that = this
    if (common.currentUrl.includes(url) || url.indexOf('search') === -1 || url.indexOf('shop') === -1) {
      const vendorItemId = location.pathname.split('.')[location.pathname.split('.').length - 1]
      if (!Number.isNaN(Number(vendorItemId))) {
        chrome.runtime.sendMessage({
          //插件监听请求
          code: 'checkAdvt',
          message: 'success',
          data: {
            spu_id: [vendorItemId],
            platform: 'shopee'
          }
        }, function(response) {
          if (response.data && response.data[vendorItemId]) {
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
    if (!/i\.\d{2,}/.test(location.href) && !location.href.includes('/product/')) {
      alert('列表页不允许执行采集操作！')
      return
    }
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

  /**
   * @description:获取详情信息
   * */

  async getPageDetails(product_id) {
    let result = {
      code: '0',
      data: {},
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    /* 区分项element */
    await common.delay(1000)
    const main_image = await ShopeeLogic.getImages()
    const details = await ShopeeLogic.getDetails()
    const attributes = await ShopeeLogic.getSpecifics()
    const shop = ShopeeLogic.getShopInfo()
    const product_no = ShopeeLogic.getProductNo()
    const category = ShopeeLogic.fetchCategory()
    const brand = ShopeeLogic.getBrandInfo()
    const video = ShopeeLogic.getVideo()
    const product_name = ShopeeLogic.getProductName()
    const favorite = ShopeeLogic.getFavorite()
    const { total_sales, total_comment, good_comment, comment_percent } = await ShopeeLogic.getEvaluation()
    const collection_sku_id = common.getRequest().collection_sku_id
    const product_details = {
      platform: 'shopee',
      site: 'br',
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      site_domain: window.location.hostname,
      product_name, // 标题
      product_type: attributes.length > 1 ? 20 : 10, // very为20 单品为10
      product_no, // amazon中ASIN即为产品id
      category, // 目录ID
      main_image,
      brand, // 品牌
      month_sales: -1, // 月销量
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
      keyword: decodeURI(common.getRequest().keyword) === 'undefined' ? '' : decodeURI(common.getRequest().keyword)
    }

    /* 合并重组数据 */
    Object.assign(result.data, product_details)
    console.log('======================================product_details===========================')
    console.log(result)
    common.selectAttributeFn(result)
  }
  // fetchCategory() {
  //   // 类目
  //   let cat = {
  //     category_id: [],
  //     category_name: [],
  //     category_tree: []
  //   }
  //   $(".flex.items-center._1z1CEl.page-product__breadcrumb a").each((i, el) => {
  //     let id = $(el).attr('href').split('/')[1]
  //     let name = $(el).text().trim()
  //     let category_id = id.slice(id.lastIndexOf('.') + 1)
  //     if (category_id !== '') {
  //       cat.category_id.push(category_id)
  //     }
  //     if (name !== 'Shopee') {
  //       cat.category_name.push(name)
  //     }
  //   })
  //   cat = {
  //     category_id: cat.category_id[cat.category_id.length - 1] || 0,
  //     category_tree: cat.category_id.length ? cat.category_id : [],
  //     category_name: cat.category_name.join("/") || ''
  //   }
  //   return cat
  // },
  // /** 
  //  * @description: 获取左侧栏主图
  //  */

  // async getImages() {
  //   let images = []
  //   const imagesArray = $('.product-briefing.flex.card._2cRTS4 .F3D_QV>div')
  //   let index = 0, count = 5
  //   while (index < imagesArray.length) {
  //     if (index === 4 && count > 0) {
  //       $('.product-briefing.flex.card._2cRTS4 .F3D_QV>button').eq(1).click()
  //       index = index - 4
  //       count--
  //       continue
  //     }
  //     await this.delay(100)
  //     let str = $(imagesArray).eq(index).find('div>div').eq(0).find('div').attr('style') ? $(imagesArray).eq(index).find('div>div').eq(0).find('div').attr('style').split(';')[0].split('(')[1] : ''
  //     let url = str.slice(str.indexOf('"') + 1, str.indexOf('_tn'))
  //     if (url !== '') {
  //       images.push(url)
  //     }
  //     index++
  //   }
  //   const arr = await Array.from(new Set(images))
  //   return arr
  // },

  // /**
  //  * @description: 评论相关
  //  */
  // getEvaluation() {
  //   const total_sales = $('.flex.flex-auto.k-mj2F .flex._32fuIU div').length ? $('.flex.flex-auto.k-mj2F .flex._32fuIU div').eq(2).find('div').eq(0).text().trim() : ''
  //   const total_comment = ''
  //   const good_comment = ''
  //   const comment_percent = ''
  //   return {
  //     total_sales,
  //     total_comment,
  //     good_comment,
  //     comment_percent
  //   }
  // },
  // /** 
  //  * @description: 获取单品信息
  //  */
  // getSingleAttr() {

  // },

  // /** 
  //  * @description: 获取区分项
  //  */

  // async getSpecifics() {
  //   let arr = []
  //   const that = this
  //   /** ====================================所有规格开始================================== **/
  //   const list1 = $('._3DepLY ._3a2wD-').find('.flex.flex-column>div').eq(0).find('div button:visible')
  //   const list2 = $('._3DepLY ._3a2wD-').find('.flex.flex-column>div').eq(1).find('div button:visible')
  //   /* 单品 */
  //   if ($(list1).closest('.items-center').prev().text() !== 'Quantity') {
  //     let index = 0
  //     while (index < list1.length) {
  //       if ($(list1).eq(index).hasClass('product-variation--disabled')) {
  //         index++
  //         continue
  //       }
  //       $(list1).eq(index).click()
  //       // await this.delay(500)
  //       if ($(list2).closest('.items-center').prev().text() === 'Quantity') {
  //         const innerSpecifc = {
  //           specifics: [
  //             {
  //               key: $(list1).eq(index).parent().prev().text().trim(),
  //               value: $(list1).eq(index).text().trim()
  //             }
  //           ]
  //         }
  //         Object.assign(innerSpecifc, await that.getBaseData())
  //         arr.push(innerSpecifc)
  //       } else {
  //         let count = 0
  //         while (count < list2.length) {
  //           if ($(list2).eq(count).hasClass('product-variation--disabled')) {
  //             count++
  //             continue
  //           }
  //           $(list2).eq(count).click()
  //           const innerSpecifc = {
  //             specifics: [{
  //               key: $(list1).eq(index).parent().prev().text().trim(),
  //               value: $(list1).eq(index).text().trim()
  //             }, {
  //               key: $(list2).eq(count).parent().prev().text().trim(),
  //               value: $(list2).eq(count).text().trim()
  //             }]
  //           }
  //           Object.assign(innerSpecifc, await that.getBaseData())
  //           arr.push(innerSpecifc)
  //           count++
  //         }
  //       }
  //       index++
  //     }
  //   } else {
  //     arr.push(await that.getBaseData())
  //   }
  //   return arr
  // },

  // /** 
  //  * @description: 获取部分属性specific，比如只有尺寸、只有颜色、只有样式等
  //  */
  // async getSectionSpecifics() {
  //   let arr = []
  //   return arr
  // },

  // /**
  //  * @description: 获取包含样式、颜色、尺寸等specific
  //  */
  // async getAllSpecies() {
  //   const arr = []
  //   return arr
  // },

  // /** 
  //  * @description: 获取每项基础数据
  //  */
  // async getBaseData() {
  //   let product_weight, images = this.getSkuImages(),
  //     { selling_price, original_price } = await this.getPrice()
  //   let baseData = {
  //     shipping: {
  //       start_arrivals: '',
  //       delivery: '',
  //       delivery_time: ''
  //     },
  //     price: {
  //       selling_price: selling_price,
  //       original_price: original_price,
  //       spike_price: '',
  //       member_price: '',
  //       promotion_price: '',
  //       flash_price: '',
  //       happy_price: ''
  //     },
  //     stock_num: await this.getStockNum(),
  //     product_weight: product_weight || 0,
  //     images,
  //     product_no: ''
  //   }
  //   return baseData
  // },
  // /** 
  //  * @description: 获取sku信息
  //  */
  // async getSkuList(baseData, outSpecific) {
  //   const arr = []
  //   return arr
  // },

  // /** 
  //  * @description: 获取价格
  //  */
  // getPrice() {
  //   return {
  //     selling_price: $('.flex.flex-auto.k-mj2F>div>div').eq(2).length ? $('.flex.flex-auto.k-mj2F>div>div').eq(2).find('div._3n5NQx').text().trim() : '',  // 售价
  //     original_price: $('.flex.flex-auto.k-mj2F>div>div').eq(2).length ? $('.flex.flex-auto.k-mj2F>div>div').eq(2).find('div._3_ISdg').text().trim() : '' // 原价
  //   }
  // },
  // /** 
  //  * @description: 获取sku图片列表
  //  */
  // getSkuImages() {
  //   const arr = []
  //   const altImages = $('#altImages ul li')
  //   let index = 0
  //   while (index < $(altImages).length) {
  //     if (![0, 1].includes(index)) {
  //       let src = $(altImages).eq(index).find('img').length ? this.formatAttr(this.formatSrc($(altImages).eq(index).find('img').attr('src').trim())) : ''
  //       if (src) {
  //         arr.push(src)
  //       }
  //     }
  //     index++
  //   }
  //   return arr
  // },

  // /** 
  //  * @description: 获取库存
  //  */
  // async getStockNum() {
  //   let val = ''
  //   val = $('._3DepLY ._3dRJGI').eq(4).find('.flex.flex-column>div').eq(3).length ?
  //     $('._3DepLY ._3dRJGI').eq(4).find('.flex.flex-column>div').eq(3).find('div').eq(1).text().trim().replace(/\s+[a-zA-Z]+/g, '') : 0
  //   return val
  // },

  // /** 
  //  * @description: 获取单品
  // */

  // getSingleAttr() {
  //   const arr = []
  //   return arr
  // },
  // /** 
  //  * @description: 获取描述
  //  */
  // async getDetails() {
  //   const detail = {
  //     params: this.getDetailParams(),
  //     images: [],
  //     video: '',
  //     description: $('.page-product__content ._2C2YFD ._2aZyWI').eq(1).length ?
  //       common.formatScript(this.formatSrc($('.page-product__content ._2C2YFD ._2aZyWI').eq(1).find('div').html().trim().replace(/(\↵|\r\n)+\s+/g, ''))) : '',
  //     packing: ''
  //   }
  //   return detail
  // },

  // /** 
  //  * @description: 获取详情params
  //  */
  // getDetailParams() {
  //   const arr = []
  //   const paramsList = $('.page-product__content ._2C2YFD ._2aZyWI').eq(0).find('div')
  //   let index = 0
  //   while (index < paramsList.length) {
  //     if (index === 0) {
  //       index++
  //       continue
  //     }
  //     arr.push({
  //       key: $(paramsList).eq(index).find('label').text().trim(),
  //       value: $(paramsList).eq(index).find('div').length ?
  //         $(paramsList).eq(index).find('div').text().trim() :
  //         $(paramsList).eq(index).find('a').length ?
  //           $(paramsList).eq(index).find('a').text().trim() : ''
  //     })
  //     index++
  //   }
  //   return this.deleteEmptyProperty(arr)
  // },

  // /** 
  //  * @description: 获取店铺信息
  //  */
  // getShopInfo() {
  //   const shopInfo = $('._1zBnTu.page-product__shop')
  //   const info = {
  //     shop_name: $(shopInfo).length ? $(shopInfo).find('div').eq(0).find('div._3Lybjn').text().trim() : '',
  //     shop_url: $(shopInfo).length ? window.location.host + '/' + $(shopInfo).find('div').eq(0).find('a').attr('href') : '', // 店铺url
  //     shop_start: $(shopInfo).length ? $(shopInfo).find('div._3mK1I2').find('._1rsHot.OuQDPE').eq(0).text().trim() : '', // 店铺星级
  //     user_rating: '', // 用户评分
  //     after_service: '', // 售后服务
  //     customer_service: '', // 服务评分
  //     logistics: '', // 物流评分
  //     dispute: '',
  //     violation: '',  // 违规
  //     description: '' // 描述
  //   }
  //   return info
  // },
  // getCategoryList() {
  //   const arr = []
  //   const categories = $('#wayfinding-breadcrumbs_feature_div ul li')
  //   if (categories.length) {
  //     let index = 0
  //     while (index < categories.length) {
  //       if ($(categories).eq(index).hasClass('a-breadcrumb-divider')) {
  //         index++
  //         continue
  //       }
  //       let categoryId = $(categories).eq(index).find('a').attr('href')
  //       const id = categoryId.slice(categoryId.indexOf('node=') + 5)
  //       arr.push(id)
  //       index++
  //     }
  //   }
  //   return arr
  // }
}