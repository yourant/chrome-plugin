const url = window.location.href
window.onload = function() {
  $('#append_details').removeClass('spider-color-forbidden')
  common.forbiddenIcon()
  detailFn.init()
}
let userCode = ''
let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: true,
  userInfo: {},
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
        console.log(response)

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
      common.setCookie('lc-main', 'en_US', 365, '.amazon.it')
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
    const category = AmazonLogic.fetchCategory()
    const product_no = AmazonLogic.getProductNo()
    const product_name = AmazonLogic.getProductName()
    const putaway_time = AmazonLogic.getPutawayTime()
    const month_sales = -1
    const favorite = -1
    const { total_sales, total_comment, good_comment, comment_percent } = await AmazonLogic.getEvaluation()
    const attributes = await AmazonLogic.getSpecifics()
    const main_image = attributes.length ? AmazonLogic.main_images : AmazonLogic.getSkuImages()
    const product_details = {
      platform: 'amazon',
      site: 'it',
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      site_domain: window.location.hostname,
      product_type: attributes.length > 1 ? 20 : 10, // very为20 单品为10
      product_name, // 标题
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
  // async fetchCategory() {
  //   // 类目
  //   const cat = {
  //     category_id: [],
  //     category_name: []
  //   };
  //   const tree_name = [];
  //   $(".a-unordered-list.a-horizontal.a-size-small a").each((i, el) => {
  //     // cat.category_id.push(el.href.slice(el.href.lastIndexOf("=") + 1));
  //     const catArr = el.href.split('&')
  //     catArr.forEach(item => {
  //       if (item.indexOf('node=') == 0) {
  //         cat.category_id.push(item.split('=')[1])
  //       }
  //     })
  //     cat.category_name.push(
  //       $(el)
  //         .text()
  //         .trim()
  //     );
  //   });
  //   return {
  //     category_id: cat.category_id[cat.category_id.length - 1],
  //     category_tree: cat.category_id,
  //     category_name: cat.category_name.join(">")
  //   };
  // },
  // /** 
  //  * @description: 获取左侧栏主图
  //  */

  // getImages(attributes) {
  //   let images = []
  //   if (attributes.length) {
  //     attributes.map((item, index) => {
  //       images = [...new Set(images.concat(item.images))]
  //     })
  //   }
  //   return images
  // },

  // /**
  //  * @description: 评论相关
  //  */
  // getEvaluation() {
  //   const total_sales = ''
  //   const total_comment = $("#acrCustomerReviewText").text()
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
  //   const product = $('#acBadge_feature_div script').text() ? JSON.parse($('#acBadge_feature_div script').text()).acAsin : ''
  //   let arr = [],
  //     baseData = {
  //       specifics: [],
  //       shipping: {},
  //       price: {},
  //       stock_num: '',
  //       product_weight: '',
  //       packing: '',
  //       images: [],
  //       product_no: product
  //     }

  //   /** ====================================所有规格开始================================== **/
  //   if (
  //     $('#variation_style_name').is(':visible') &&
  //     $('#variation_color_name').is(':visible') &&
  //     $('#variation_size_name').is(':visible')) {
  //     arr.push(...await this.getAllSpecies(baseData))
  //   }

  //   /** ====================================所有规格结束================================== **/

  //   /* 尺寸 */
  //   else if ($('#variation_size_name').is(':visible')) {
  //     if ($('#variation_size_name select').length) {
  //       $('#variation_size_name select').click()
  //       const variationSizeList = $('#native_dropdown_selected_size_name option').length ?
  //         $('#native_dropdown_selected_size_name option') :
  //         $("div.a-popover.a-dropdown.a-dropdown-common.a-declarative").find('ul li')
  //       arr.push(...await this.getSectionSpecifics(baseData, variationSizeList, 'size'))
  //     } else {
  //       arr.push(...await this.getAllSpecies(baseData))
  //     }
  //   }
  //   /* 样式 */
  //   else if ($('#variation_style_name').is(':visible')) {
  //     if ($('#variation_style_name select').length) {
  //       $('#variation_style_name select').click()
  //       const variationStyleList = $('#variation_style_name ul li').length ?
  //         $('#variation_style_name ul li') :
  //         $("div.a-popover.a-dropdown.a-dropdown-common.a-declarative").find('ul li')
  //       arr.push(...await this.getSectionSpecifics(baseData, variationStyleList, 'style'))
  //     } else {
  //       arr.push(...await this.getAllSpecies(baseData))
  //     }
  //   }
  //   /* 颜色 */
  //   else if ($('#variation_color_name').is(':visible')) {
  //     if ($('#variation_color_name select').length) {
  //       $('#variation_color_name select').click()
  //       const variationColorList = $('#variation_color_name ul li').length ?
  //         $('#variation_color_name ul li') :
  //         $("div.a-popover.a-dropdown.a-dropdown-common.a-declarative").find('ul li')
  //       arr.push(...await this.getSectionSpecifics(baseData, variationColorList, 'color'))
  //     } else {
  //       arr.push(...await this.getAllSpecies(baseData))
  //     }
  //   }

  //   console.log(arr);

  //   return arr
  // },

  // /**
  //  * @description: 获取部分属性specific，比如只有尺寸、只有颜色、只有样式等
  //  */
  // async getSectionSpecifics(baseData, element, type) {
  //   const that = this
  //   let index = 0, arr = [], list = []
  //   if ($(element).length > 0) {
  //     while (index < $(element).length) {
  //       if (index === 0 && $(element).eq(index).find('a').text().trim() === 'Select' || (index === 0 && $(element).eq(index).text().trim() === 'Seleziona')) {
  //         index++
  //         continue
  //       }
  //       /* 如果下拉框隐藏  则点击 */
  //       if ($("div.a-popover.a-dropdown.a-dropdown-common.a-declarative:visible").length === 0 ||
  //         $("div.a-popover.a-dropdown.a-dropdown-common.a-declarative").is(':hidden')) {
  //         /* 根据不同的类型，点击不同的下拉框 */
  //         if (type === 'size') {
  //           $('#variation_size_name select').click()
  //         } else if (type === 'style') {
  //           $('#variation_style_name select').click()
  //           $(element).eq(index).find('.a-button-text').click()
  //         } else if (type === 'color') {
  //           $('#variation_color_name select').click()
  //         } else if (type === 'size2') {
  //           $('#variation_size_name select').click()
  //         }
  //         await that.delay(1000)
  //       }
  //       // if ($("div.a-popover.a-dropdown.a-dropdown-common.a-declarative").find('ul li').eq(index).find('a').length) {
  //       //   $("div.a-popover.a-dropdown.a-dropdown-common.a-declarative").find('ul li').eq(index).find('a')[0].click()
  //       // }

  //       $(element).eq(index).find('.a-button-text').click()

  //       let outSpecific = []
  //       if (type === 'size' || type === "size2") {
  //         if ($('#variation_size_name select').find('option').eq(index)) { // 以上size都打不开select时
  //           // $('#variation_size_name select').find('option').eq(index).click()
  //           $('#variation_size_name select').find('option').eq(index).attr("selected", true)
  //           $('#variation_size_name select').find('option').eq(index).addClass('dropdownSelect').removeClass('dropdownAvailable')
  //           $('#variation_size_name select').find('option').eq(index).siblings().addClass('dropdownAvailable').removeClass('dropdownSelect')
  //           $('#variation_size_name select').find('option').eq(0).val($('#variation_size_name select').find('option').eq(index).val())
  //           $('#variation_size_name select').find('option').eq(0).text($('#variation_size_name select').find('option').eq(index).text().trim())
  //           await that.delay(1000)
  //         }
  //         outSpecific = [{
  //           key: that.formatText($('#variation_size_name .a-row').find('.a-form-label').text().trim()),
  //           value: that.formatText($('#variation_size_name .a-row').find('.selection').text().trim()) || that.formatText($('#native_dropdown_selected_size_name .dropdownSelect').text().trim()),
  //         }]
  //       } else if (type === "style") {
  //         outSpecific = [{
  //           key: that.formatText($('#variation_style_name .a-row').find('.a-form-label').text().trim()),
  //           value: that.formatText($('#variation_style_name .a-row').find('span.selection').text().trim())
  //         }]
  //       }
  //       list = await that.getSkuList(baseData, outSpecific)
  //       arr.push(...list)
  //       index++
  //     }
  //   } else {
  //     /* 单品 */
  //     list = await that.getSkuList(baseData)
  //     arr.push(...list)
  //   }
  //   return arr
  // },
  // /**
  //  * @description: 获取包含样式、颜色、尺寸等specific
  //  */
  // async getAllSpecies(data) {
  //   const styleList = $('#variation_style_name ul li'),
  //     colorList = $('#variation_color_name ul li'),
  //     sizeList = $('#variation_size_name select option').length ? $('#variation_size_name select option') : $('#variation_size_name ul li'),
  //     FlavorList = $('#variation_flavor_name ul li'),
  //     { selling_price, original_price } = await this.getPrice(),
  //     that = this
  //   let arr = [], outSpecific = [], shipping = {}, price = {}, product_weight

  //   price = {
  //     selling_price: selling_price,
  //     original_price: original_price,
  //     spike_price: '',
  //     member_price: '',
  //     promotion_price: '',
  //     flash_price: '',
  //     happy_price: ''
  //   }
  //   shipping = {
  //     start_arrivals: '',
  //     delivery: '',
  //     delivery_time: ''
  //   }

  //   let baseData = {
  //     specifics: [],
  //     shipping: shipping,
  //     price: price,
  //     stock_num: await that.getStockNum(),
  //     product_weight: product_weight || 0,
  //     images: this.getSkuImages()
  //   }

  //   if ($(styleList).length) { // 风格遍历  =》 specifics添加 {key,value} >颜色遍历 specifics[1]添加颜色》..specifics[2]
  //     /* 
  //     *最后格式  specifics:[{风格1}，{颜色1}，{尺寸1}]...搭配的种类一共= 每种个数相乘
  //     */
  //     /* 样式循环 */
  //     let index = 0
  //     while (index < $(styleList).length) {
  //       /* 点击按钮 */
  //       $(styleList).eq(index).find('button').click()
  //       await that.delay(1000)

  //       baseData.specifics[0] = {
  //         key: that.formatText($('#variation_style_name').find('label.a-form-label').text().trim()),
  //         value: that.formatText($('#variation_style_name').find('span.selection').text().trim())
  //       }
  //       if ($(colorList).length) {
  //         /* 颜色循环 */
  //         let count = 0
  //         while (count < $(colorList).length) {
  //           /* 点击按钮 */
  //           $(colorList).eq(count).find('button').click()
  //           await that.delay(1000)
  //           baseData.specifics[1] = {
  //             key: that.formatText($('#variation_color_name').find('label.a-form-label').text().trim()),
  //             value: that.formatText($('#variation_color_name').find('span.selection').text().trim())
  //           }
  //           /* 数据合并 */
  //           let newData = Object.assign(JSON.parse(JSON.stringify(data)), JSON.parse(JSON.stringify(baseData))) // 对象的合并 直接data数据的话会使data改变成baseData 导致每条数据到最后一样
  //           arr.push(newData)

  //           if ($(sizeList).length) {
  //             /* 尺寸循环 */
  //             for (let s in $(sizeList)) {
  //               /* 点击按钮 */
  //               if (isNaN(s)) {
  //                 break
  //               }
  //               $(sizeList).eq(s).find('button').click()
  //               await that.delay(1000)
  //               baseData.specifics[2] = {
  //                 key: that.formatText($('#variation_size_name .a-row').find('label.a-form-label').text().trim()),
  //                 value: that.formatText($('#variation_size_name .a-row').find('span.selection').text().trim())
  //               }
  //               let newData2 = Object.assign(JSON.parse(JSON.stringify(data)), JSON.parse(JSON.stringify(baseData))) // 对象的合并 直接data数据的话会使data改变成baseData 导致每条数据到最后一样
  //               arr.push(newData2)
  //               if ($(FlavorList).length) {
  //                 for (let i in $(FlavorList)) {
  //                   if (isNaN(i)) { // 循环出现i='selector'导致再循环一次
  //                     break
  //                   }
  //                   if ($(FlavorList).eq(i).hasClass('swatchAvailable')) { // 可选执行才点击，否则其他类型选项会自动跨到下一个选项
  //                     //每次遍历到最后一组遍历的数据在变化，把前面的存起来，每次改变最后一个数据，依次添加到arr
  //                     $(FlavorList).eq(i).find('.a-button-text').click()
  //                     await that.delay(1000)

  //                     baseData.specifics[3] = {
  //                       key: that.formatText($('#variation_flavor_name .a-row').find('.a-form-label').text().trim()),
  //                       value: that.formatText($('#variation_flavor_name .a-row').find('.selection').text().trim())
  //                     }
  //                     let newData3 = Object.assign(JSON.parse(JSON.stringify(data)), JSON.parse(JSON.stringify(baseData))) // 对象的合并 直接data数据的话会使data改变成baseData 导致每条数据到最后一样
  //                     arr.push(newData3)
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //           count++
  //         }
  //       }
  //       index++
  //       // 当style 循环完
  //     }
  //   } else if ($(colorList).length) {
  //     /* 颜色循环 */
  //     let count = 0
  //     while (count < $(colorList).length) {
  //       /* 点击按钮 */
  //       $(colorList).eq(count).find('button').click()
  //       await that.delay(1000)
  //       baseData.specifics[0] = {
  //         key: that.formatText($('#variation_color_name').find('label.a-form-label').text().trim()),
  //         value: that.formatText($('#variation_color_name').find('span.selection').text().trim())
  //       }
  //       let newData = Object.assign(JSON.parse(JSON.stringify(data)), JSON.parse(JSON.stringify(baseData))) // 对象的合并 直接data数据的话会使data改变成baseData 导致每条数据到最后一样
  //       arr.push(newData)
  //       if ($(sizeList).length) {
  //         /* 尺寸循环 */
  //         for (let s in $(sizeList)) {
  //           /* 点击按钮 */
  //           if (isNaN(s)) {
  //             break
  //           }
  //           $(sizeList).eq(s).find('button').click()
  //           await that.delay(1000)
  //           // 每次循环第二层不要一直往第一层push第二层数据，应该是替换掉 如 [{颜色1}{尺寸1}] 下次就是 [{颜色1}{尺寸2}]
  //           baseData.specifics[1] = {
  //             key: that.formatText($('#variation_size_name .a-row').find('label.a-form-label').text().trim()),
  //             value: that.formatText($('#variation_size_name .a-row').find('span.selection').text().trim())
  //           }
  //           let newData1 = Object.assign(JSON.parse(JSON.stringify(data)), JSON.parse(JSON.stringify(baseData))) // 对象的合并 直接data数据的话会使data改变成baseData 导致每条数据到最后一样
  //           arr.push(newData1)
  //           if ($(FlavorList).length) {
  //             for (let i in $(FlavorList)) {
  //               if (isNaN(i)) { // 循环最后出现i='selector'导致再循环一次，阻止
  //                 break
  //               }
  //               if ($(FlavorList).eq(i).hasClass('swatchAvailable')) { // 可选执行才点击，否则其他类型选项会自动跨到下一个选项
  //                 $(FlavorList).eq(i).find('.a-button-text').click()
  //                 await that.delay(1000)

  //                 baseData.specifics[2] = {
  //                   key: that.formatText($('#variation_flavor_name .a-row').find('.a-form-label').text().trim()),
  //                   value: that.formatText($('#variation_flavor_name .a-row').find('.selection').text().trim())
  //                 }
  //                 let newData2 = Object.assign(JSON.parse(JSON.stringify(data)), JSON.parse(JSON.stringify(baseData))) // 对象的合并 直接data数据的话会使data改变成baseData 导致每条数据到最后一样
  //                 arr.push(newData2)
  //               }
  //             }
  //           }
  //         }
  //       }
  //       count++
  //     }
  //   }
  //   else if ($(sizeList).length) {
  //     /* 尺寸循环 */
  //     for (let s in $(sizeList)) {
  //       /* 点击按钮 */
  //       if (isNaN(s)) {
  //         break
  //       }
  //       $(sizeList).eq(s).find('button').click()
  //       await that.delay(1000)
  //       baseData.specifics[0] = {
  //         key: that.formatText($('#variation_size_name .a-row').find('label.a-form-label').text().trim()),
  //         value: that.formatText($('#variation_size_name .a-row').find('span.selection').text().trim())
  //       }
  //       let newData = Object.assign(JSON.parse(JSON.stringify(data)), JSON.parse(JSON.stringify(baseData))) // 对象的合并 直接data数据的话会使data改变成baseData 导致每条数据到最后一样
  //       arr.push(newData)
  //       if ($(FlavorList).length) {
  //         for (let i in $(FlavorList)) {
  //           if (isNaN(i)) { // 循环出现i='selector'导致再循环一次
  //             break
  //           }
  //           if ($(FlavorList).eq(i).hasClass('swatchAvailable')) { // 可选执行才点击，否则其他类型选项会自动跨到下一个选项
  //             $(FlavorList).eq(i).find('.a-button-text').click()
  //             await that.delay(1000)

  //             baseData.specifics[1] = {
  //               key: that.formatText($('#variation_flavor_name .a-row').find('.a-form-label').text().trim()),
  //               value: that.formatText($('#variation_flavor_name .a-row').find('.selection').text().trim())
  //             }
  //             let newData2 = Object.assign(JSON.parse(JSON.stringify(data)), JSON.parse(JSON.stringify(baseData))) // 对象的合并 直接data数据的话会使data改变成baseData 导致每条数据到最后一样
  //             arr.push(newData2)
  //           }
  //         }
  //       }
  //     }
  //   } else if ($(FlavorList).length) {
  //     for (let i in FlavorList) {
  //       $(FlavorList[i]).find('.a-button-text').click()
  //       await that.delay(1000)
  //       baseData.specifics.push({
  //         key: $('#variation_flavor_name .a-row').find('.a-form-label').text().trim(),
  //         value: $('#variation_flavor_name .a-row').find('.selection').text().trim()
  //       })
  //       /* 将所有数据合并 */
  //       let newData = Object.assign(JSON.parse(JSON.stringify(data)), baseData) // 对象的合并 直接data数据的话会使data改变成baseData 导致每条数据到最后一样
  //       arr.push(newData)
  //     }
  //   }
  //   this.initSpecifics()
  //   return arr
  // },
  // /** 
  //  * @description: 获取sku信息
  //  */
  // async getSkuList(baseData, outSpecific) {
  //   const that = this,
  //     skuList = $('#variation_color_name ul li'),
  //     { selling_price, original_price } = await this.getPrice()
  //   let arr = [], shipping = {}, price = {}, product_weight, count = 0
  //   // product_weight = $('#detailBullets_feature_div') ? $('#detailBullets_feature_div ul li').eq(0).find('span>span').eq(1).text() : 0
  //   if ($(skuList).length) {
  //     while (count < skuList.length) {
  //       // if ($(skuList).eq(count).hasClass('swatchUnavailable')) {
  //       //   $(skuList).eq(count).removeClass('swatchUnavailable').addClass('swatchAvailable')
  //       // }
  //       if ($(skuList).eq(count).hasClass('swatchAvailable') || $(skuList).eq(count).hasClass('swatchSelect')) {
  //         $(skuList).eq(count).find('img').click()
  //         const flag = await this.delayTime(2000)
  //         if (flag) {
  //           price = {
  //             selling_price: selling_price,
  //             original_price: original_price,
  //             spike_price: '',
  //             member_price: '',
  //             promotion_price: '',
  //             flash_price: '',
  //             happy_price: ''
  //           }
  //           shipping = {
  //             start_arrivals: '',
  //             delivery: $("#mod-detail-bd .obj-carriage .cost-entries-type").length ?
  //               $("#mod-detail-bd .obj-carriage .cost-entries-type").find('p').text().trim() :
  //               $("#mod-detail-bd .obj-carriage").find('div').find('span').eq(0).text().trim(),
  //             delivery_time: ''
  //           }
  //           specific = {
  //             key: that.formatText($('#variation_color_name').find('div.a-row label').text().trim()),
  //             value: $('#variation_color_name').find('span.selection').length ?
  //               that.formatText($('#variation_color_name').find('span.selection').text().trim()) : ''
  //           }
  //           baseData = {
  //             specifics: Array.isArray(outSpecific) ? [specific].concat(outSpecific) : [specific],
  //             shipping: shipping,
  //             price: price,
  //             stock_num: await that.getStockNum(),
  //             product_weight: product_weight || 0,
  //             images: this.getSkuImages()
  //           }
  //           await arr.push(baseData)
  //         }
  //       }
  //       count++
  //     }
  //   } else {
  //     shipping = {
  //       start_arrivals: '',
  //       delivery: $("#mod-detail-bd .obj-carriage .cost-entries-type").length ?
  //         $("#mod-detail-bd .obj-carriage .cost-entries-type").find('p').text().trim() :
  //         $("#mod-detail-bd .obj-carriage").find('div').find('span').eq(0).text().trim(),
  //       delivery_time: ''
  //     }
  //     baseData = {
  //       specifics: Array.isArray(outSpecific) ? outSpecific : [],
  //       shipping: shipping,
  //       price: price,
  //       stock_num: await that.getStockNum(),
  //       product_weight: product_weight || 0,
  //       images: this.getSkuImages()
  //     }
  //     await arr.push(baseData)
  //   }
  //   return arr
  // },

  // /** 
  //  * @description: 获取价格
  //  */
  // getPrice() {
  //   let selling_price = '', newPrice = ''
  //   newPrice = $('#olp-upd-new a').length ? $('#olp-upd-new a').text().slice($('#olp-upd-new a').text().indexOf('$')) : ''
  //   selling_price = $('#price table tr').length ? $('#price table tr').eq(1).find('td').eq(1).find('span').eq(0).text().trim() : newPrice
  //   return {
  //     selling_price: selling_price,  // 售价
  //     original_price: $('#price table tr').eq(0).find('td').eq(1).find('span').eq(0).text().trim() || '' // 原价
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
  //       if (src && src.indexOf('PKmb-play-button-overlay-thumb') === -1) {
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
  //   val = await $('#quantity option').length ? $('#quantity option').eq($('#quantity option').length - 1).val().trim() : 0
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
  //     feature_bullets: await this.getFeatureBullets(),
  //     sale_rank: this.getSaleRank(),
  //     description: $('#productDescription_feature_div').length ?
  //       this.formatSrc($('#productDescription_feature_div').html().trim().replace(/(\↵|\r\n)+\s+/g, '')) :
  //       $('#aplus>div').length ? this.formatSrc($('#aplus>div').html().trim().replace(/(\↵|\r\n)+\s+/g, '')) : '',
  //     product_information: $('#prodDetails>div').length ? this.formatSrc($('#prodDetails>div').html().trim().replace(/(\↵|\r\n)+\s+/g, '')) : '',
  //     packing: ''
  //   }
  //   return detail
  // },
  // /** 
  //  * @description: 商品排名
  // */
  // getSaleRank() {
  //   const sale_rank = [], that = this
  //   const saleRankList = $('#dpx-amazon-sales-rank_feature_div ul li')
  //   let index = 0
  //   while (index < saleRankList.length) {
  //     sale_rank.push({
  //       key: $(saleRankList).eq(index).find('span a').text(),
  //       value: that.formatNumber($(saleRankList).eq(index).find('span').text().trim())
  //     })
  //     index++
  //   }
  //   const str = $('#SalesRank').text().trim()
  //   const strs = str.slice(str.indexOf('#') + 1, str.indexOf('(')).trim()
  //   sale_rank.push({
  //     key: strs.slice(strs.indexOf('in') + 3),
  //     value: strs.slice(0, str.indexOf('in') - 1),
  //   })
  //   return that.deleteEmptyProperty(sale_rank)
  // },

  // /** 
  //  * @description: 获取商品功能属性
  //  */
  // async getFeatureBullets() {
  //   const arr = []
  //   const featureBullets = $('#feature-bullets ul li')
  //   await this.delay(500)
  //   if ($('#feature-bullets div a').length) {
  //     $('#feature-bullets div a')[0].click()
  //   }
  //   let index = 0
  //   while (index < $(featureBullets).length) {
  //     if ($(featureBullets).eq(index).attr('id')) {
  //       index++
  //       continue
  //     }
  //     arr.push($(featureBullets).eq(index).find('span').text().trim())
  //     index++
  //   }
  //   return arr
  // },

  // /** 
  //  * @description: 获取详情params
  //  */
  // getDetailParams() {
  //   const arr = []
  //   const paramsList = $('#detail-bullets_feature_div ul li')

  //   let index = 0
  //   if (paramsList.length > 0) {
  //     while (index < $(paramsList).length) {
  //       const texts = $(paramsList).eq(index).text()
  //       arr.push({
  //         key: texts.split(':')[0],
  //         value: texts.split(':')[1]
  //       })
  //       index++
  //     }
  //     return this.deleteEmptyProperty(arr)
  //   } else {
  //     let productDetails = $("#prodDetails").find("table tr")
  //     if ($(productDetails).length > 0) {
  //       while (index < $(productDetails).length) {
  //         arr.push({
  //           key: this.formatText($(productDetails).eq(index).find('th').text().trim()) ? this.formatText($(productDetails).eq(index).find('th').text().trim()) : this.formatText($(productDetails).eq(index).find('td').eq(0).text().trim()),
  //           value: this.formatText($(productDetails).eq(index).find('th').text().trim()) ? this.formatText($(productDetails).eq(index).find('td').text().trim()) : this.formatText($(productDetails).eq(index).find('td').eq(1).text().trim()),
  //         })
  //         index++
  //       }
  //       return this.deleteEmptyProperty(arr)

  //     } else {
  //       let productDetails1 = $("#technicalSpecifications_feature_div").find("table tr")
  //       while (index < $(productDetails1).length) {
  //         arr.push({
  //           key: this.formatText($(productDetails).eq(index).find('th').text().trim()) ? this.formatText($(productDetails).eq(index).find('th').text().trim()) : this.formatText($(productDetails).eq(index).find('td').eq(0).text().trim()),
  //           value: this.formatText($(productDetails).eq(index).find('th').text().trim()) ? this.formatText($(productDetails).eq(index).find('td').text().trim()) : this.formatText($(productDetails).eq(index).find('td').eq(1).text().trim()),
  //         })
  //         index++
  //       }
  //       return this.deleteEmptyProperty(arr)
  //     }

  //   }
  // },

  // /** 
  //  * @description: 获取店铺信息
  //  */
  // getShopInfo() {
  //   const info = {
  //     shop_name: $('#bylineInfo').length ? $('#bylineInfo').text().trim() : '',
  //     shop_url: $('#bylineInfo').length ? 'https://www.amazon.com/' + $('#bylineInfo').attr('href') : '', // 店铺url
  //     shop_start: '', // 店铺星级
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

  // /** 
  //  * @description: 初始化所有规格
  //  */
  // initSpecifics() {
  //   $('#variation_style_name ul li').eq(0).find('button').click()
  //   $('#variation_color_name ul li').eq(0).find('button').click()
  //   $('#variation_size_name ul li').eq(0).find('button').click()
  // }
}