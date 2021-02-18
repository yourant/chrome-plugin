var ShopeeLogic = {

  /**
   * @description: 获取product no
   */
  getProductNo() {
    const url = window.location.href.split('?')[0].replace(/\/$/, '')
    let str = ''
    // location.pathname.split('.')[location.pathname.split('.').length - 1]
    const dg = url.includes('/product/') ? '/' : '.'
    str = url.slice(url.lastIndexOf(dg) + 1)
    return str
  },
  fetchCategory() {
    // 类目
    let cat = {
      category_id: [],
      category_name: [],
      category_tree: []
    }
    const listEl = $('.flex.items-center._1z1CEl.page-product__breadcrumb')
    listEl.find('a').each((i, el) => {
      if (i) {
        let id = $(el).attr('href').split('/')[1]
        let name = $(el).text().trim()
        let category_id = id.slice(id.lastIndexOf('.') + 1)
        cat.category_name.push(name)
        if (category_id !== '') {
          cat.category_id.push(category_id)
        }
        // const spanEl = listEl.find('span')
        // if (listEl.find('span').length) {
        //   cat.category_name.push(spanEl.text().trim())
        // }
      }
    })
    cat = {
      category_id: cat.category_id[cat.category_id.length - 1] || 0,
      category_tree: cat.category_id.length ? cat.category_id : [],
      category_name: cat.category_name.join('>') || ''
    }
    return cat
  },

  /**
   * @description: 获取标题
   */
  getProductName() {
    let nameEl = null, text = ''
    if ($('.flex.items-center._1z1CEl.page-product__breadcrumb').length) {
      nameEl = $('.flex.items-center._1z1CEl.page-product__breadcrumb span')
    } else if ($('.qaNIZv').length) {
      nameEl = $('.qaNIZv')
    }
    text = nameEl.text().trim()
    return text
  },

  /**
   * @description: 获取左侧栏主图
   */

  async getImages() {
    let images = []
    let prev_url = ''
    while (true) {
      const image_url = document.querySelector('.product-briefing.flex.card._2cRTS4 .F3D_QV>div:nth-child(1)>div>div>div').style.backgroundImage
      if (prev_url === image_url) {
        await common.delay(4000)
        const imagesArray = document.querySelectorAll('.product-briefing.flex.card._2cRTS4 .F3D_QV>div')
        for (let k = 1; k < imagesArray.length; k++) {
          let target_url = imagesArray[k].children[0].children[0].children[0].style.backgroundImage
          images.push(target_url.slice(target_url.indexOf('"') + 1, target_url.indexOf('_tn')))
        }
        break
      } else {
        prev_url = image_url
        $('.product-briefing.flex.card._2cRTS4 .F3D_QV>button').eq(1).click()
        await common.delay(1500)
        let url = image_url.slice(image_url.indexOf('"') + 1, image_url.indexOf('_tn'))
        images.push(url)
      }
    }
    images = images.filter(v => v)
    return images
  },

  /**
   * @description: 评论相关
   */
  getEvaluation() {
    const total_sales = $('.flex.flex-auto.k-mj2F .flex._32fuIU div').length ? $('.flex.flex-auto.k-mj2F .flex._32fuIU div').eq(2).find('div').eq(0).text().trim() : ''
    const total_comment = ''
    const good_comment = ''
    const comment_percent = ''
    return {
      total_sales,
      total_comment,
      good_comment,
      comment_percent
    }
  },
  /**
   * @description: 获取单品信息
   */
  getSingleAttr() {

  },

  /**
   * @description: 获取tw站点
   */
  async getTWSpecifics() {
    let arr = []
    const that = this
    /** ====================================所有规格开始================================== **/
    const allVarition = Array.from($('._3DepLY ._3a2wD- .flex-column> .items-center'))
    // 所有区分项，length为0即为单品
    allVarition.splice(allVarition.length - 1, 1)
    // vari产品组装区分项
    if (allVarition.length) {
      // 暂定两个区分项
      const list1 = allVarition.length > 0 ? {
        key: $(allVarition[0].children[0]).text(),
        child: allVarition[0].children[1].children
      } : undefined
      const list2 = allVarition.length > 1 ? {
        key: $(allVarition[1].children[0]).text(),
        child: allVarition[1].children[1].children
      } : undefined
      // 还原初始页面

      if (list1) {
        Array.from(list1.child).forEach(v => {
          if ($(v).prop('className').indexOf('selected') !== -1) {
            $(v).click()
          }
        })
      }
      if (list2) {
        Array.from(list2.child).forEach(v => {
          if ($(v).prop('className').indexOf('selected') !== -1) {
            $(v).click()
          }
        })
      }

      let index = 0
      while (index < list1.child.length) {
        // await that.delay(500)
        if ($(list1).eq(index).hasClass('product-variation--disabled')) {
          $(list1).eq(index).removeClass('product-variation--disabled')
        }
        $(list1.child[index]).click()
        if (!list2) {
          const innerSpecifc = {
            specifics: [
              {
                key: list1.key,
                value: $(list1.child[index]).text().trim()
              }
            ]
          }
          Object.assign(innerSpecifc, await that.getBaseData())
          arr.push(innerSpecifc)
        }
        let count = 0
        while (list2 && count < list2.child.length) {
          // await that.delay(500)
          if ($(list2).eq(count).hasClass('product-variation--disabled')) {
            $(list2).eq(count).removeClass('product-variation--disabled')
          }
          Array.from(list2.child).forEach(v => {
            if ($(v).prop('className').indexOf('selected') !== -1) {
              $(v).click()
            }
          })
          $(list2.child[count]).click()
          const innerSpecifc = {
            specifics: [
              {
                key: list1.key,
                value: $(list1.child[index]).text().trim()
              }, {
                key: list2.key,
                value: $(list2.child[count]).text().trim()
              }]
          }
          Object.assign(innerSpecifc, await that.getBaseData())
          arr.push(innerSpecifc)
          count++
        }
        index++
      }
    } else {
      arr = [
        await that.getBaseData()
      ]
    }
    return arr
  },

  /**
   * @description: 获取区分项
   */

  async getSpecifics() {
    let arr = []
    const that = this
    /** ====================================所有规格开始================================== **/
    const list1 = $('._3DepLY ._3a2wD-').find('.flex.flex-column>div').eq(0).find('div button:visible')
    const list2 = $('._3DepLY ._3a2wD-').find('.flex.flex-column>div').eq(1).find('div button:visible')
    const filterArr = [
      'Kuantitas',
      'Quantity',
      'Số Lượng'
    ]
    /* 单品 */
    if (!filterArr.includes($(list1).closest('.items-center').prev().text())) {
      console.log('第一层不是quantity')
      let index = 0
      if (list1.length) {
        while (index < list1.length) {
          if ($(list1).eq(index).hasClass('product-variation--disabled')) {
            $(list1).eq(index).removeClass('product-variation--disabled')
            // index++
            // continue
          }
          $(list1).eq(index).click()
          if (!filterArr.includes($(list2).closest('.items-center').prev().text())) {
            if (!list2.length) {
              const innerSpecifc = {
                specifics: [
                  {
                    key: $(list1).eq(index).parent().prev().text().trim(),
                    value: $(list1).eq(index).text().trim()
                  }
                ]
              }
              Object.assign(innerSpecifc, that.getBaseData())
              arr.push(that.getBaseData())
            }
            let count = 0
            console.log('第二层区分项获取')
            while (count < list2.length) {
              if ($(list2).eq(count).hasClass('product-variation--disabled')) {
                $(list2).eq(count).removeClass('product-variation--disabled')
                // count++
                // continue
              }
              $(list2).eq(count).click()
              let innerSpecifc = {
                specifics: [
                  {
                    key: $(list1).eq(index).parent().prev().text().trim(),
                    value: $(list1).eq(index).text().trim()
                  }, {
                    key: $(list2).eq(count).parent().prev().text().trim(),
                    value: $(list2).eq(count).text().trim()
                  }]
              }
              Object.assign(innerSpecifc, that.getBaseData())
              arr.push(innerSpecifc)
              count++
            }
          } else {
            console.log('第二层不是quantity')
            const innerSpecifc = {
              specifics: [
                {
                  key: $(list1).eq(index).parent().prev().text().trim(),
                  value: $(list1).eq(index).text().trim()
                }
              ]
            }
            Object.assign(innerSpecifc, that.getBaseData())
            arr.push(innerSpecifc)
          }
          index++
        }
      } else {
        console.log('zzz')
        arr.push(that.getBaseData())
      }
    } else {
      console.log('单品')
      arr.push(that.getBaseData())
    }
    return arr
  },

  /**
   * @description: 获取每项基础数据
   */
  getBaseData() {
    let images = this.getSkuImages(),
        price = this.getPrice(),
        shipping = this.getShpping()
    let baseData = {
      shipping,
      price,
      stock_num: Number(document.querySelector('._3DepLY ._3a2wD- ._1FzU2Y').children[1].children[1].innerText.replace(/\D/g,'')),
      product_weight: 0,
      images,
      product_no: this.getProductNo()
    }
    return baseData
  },
  /**
   * @description: 获取sku信息
   */
  async getSkuList(baseData, outSpecific) {
    const arr = []
    return arr
  },

  /**
   * @description: 获取运输方式
   */
  getShpping() {
    return {
      start_arrivals: '',
      delivery: '',
      delivery_time: ''
    }
  },

  /**
   * @description: 获取价格
   */
  getPrice() {
    // formatNumber
    function formatOriginPrice(val) {
      if (val) {
        return common.formatCurrency(val)
      }
      return '0.00'
    }
    return {
      selling_price: $('.flex.flex-auto.k-mj2F>div>div').eq(2).length ?
          common.formatCurrency($('.flex.flex-auto.k-mj2F>div>div').eq(2).find('div._3n5NQx').text().trim()) : '0.00',  // 售价
      original_price: formatOriginPrice($('.flex.flex-auto.k-mj2F>div>div').eq(2).find('div._3_ISdg').text().trim()) // 原价
      // spike_price: '0.00',
      // member_price: '0.00',
      // promotion_price: '0.00',
      // flash_price: '0.00',
      // happy_price: '0.00'
    }
  },
  /**
   * @description: 获取sku图片列表
   */
  getSkuImages(el) {
    const arr = []
    if (el) {
      if (el.find('img').length) {
        let src = common.formatSrc(el.find('img').attr('src'))
        arr.push(src)
      }
    }
    return Array.from(new Set(arr))
  },

  /**
   * @description: 获取库存
   */
  // getStockNum() {
  //   let val = ''
  //   val = $('._3DepLY ._3a2wD- ._1FzU2Y').find('.items-center>div').eq(1).length ?
  //       $('._3DepLY ._3a2wD- ._1FzU2Y').find('.items-center>div').eq(1).text().trim().replace(/\D/g, '') : '0'
  //   return val
  // },

  /**
   * @description: 获取品牌
   */
  getBrandInfo() {
    const trElement = $('.page-product__content ._2C2YFD ._2aZyWI')
    let brand = '', index = 0, filterBrand = ['品牌', 'Brand', 'Merek', 'Thương hiệu']
    while (index < trElement.find('div.kIo6pj').length) {
      if (filterBrand.includes(trElement.find('div.kIo6pj').eq(index).find('label').text().trim())) {
        if (trElement.find('div.kIo6pj').eq(index).find('div').length) {
          brand = trElement.find('div.kIo6pj').eq(index).find('div').text().trim()
        }
        if (trElement.find('div.kIo6pj').eq(index).find('a').length) {
          brand = trElement.find('div.kIo6pj').eq(index).find('a').text().trim()
        }
      }
      index++
    }
    return brand
  },

  /**
   * @description: 获取单品
   */

  getSingleAttr() {
    const arr = []
    return arr
  },
  /**
   * @description: 获取描述
   */
  async getDetails() {
    // ↓
    let description = '', el = null
    if ($('.page-product__content ._2C2YFD ._2aZyWI').length) {
      el = $('.page-product__content ._2C2YFD ._2aZyWI').eq(1)
      description = common.formatScript(common.formatSrc(el.find('div').html()))
    }
    description = description.replace(/(↵|\r\n|↓)+\s+/g, '').replace(/\?+/g, '.').replace(/[\n↵\r]+/g, '').replace(/\s+/g,' ')
    return {
      params: this.getDetailParams(),
      images: [],
      video: '',
      description,
      packing: ''
    }
  },

  /**
   * @description: 获取详情params
   */
  getDetailParams() {
    const arr = []
    const paramsList = $('.page-product__content ._2C2YFD ._2aZyWI').eq(0).find('div')
    let index = 0
    while (index < paramsList.length) {
      if (index === 0) {
        index++
        continue
      }
      if (!['Brand', 'Merek'].includes($(paramsList).eq(index).find('label').text().trim())) {
        arr.push({
          key: $(paramsList).eq(index).find('label').text().trim(),
          value: $(paramsList).eq(index).find('div').length ?
              $(paramsList).eq(index).find('div').text().trim() :
              $(paramsList).eq(index).find('a').length ?
                  $(paramsList).eq(index).find('a').text().trim() : ''
        })
      }
      index++
    }
    return common.deleteEmptyProperty(arr)
  },

  /**
   * @description: 获取收藏数
   */
  getFavorite() {
    let el = null, src = ''
    if ($('._25DJo1')) {
      el = $('._25DJo1')
    }
    src = el.text().trim()
    if (src.indexOf('(') !== -1 && src.indexOf(')') !== -1) {
      src = src.slice(src.indexOf('(') + 1, src.indexOf(')'))
    }
    // src = el.text().trim().replace('Favorite (', '').replace(')', '')
    return common.formatNumber(src.replace(/k|K/g, src.includes('.') ? '00' : '000'))
  },

  /**
   * @description: 获取店铺信息
   */
  getShopInfo() {
    const shopInfo = $('._1zBnTu.page-product__shop')
    let shop_name = '', shop_url = ''
    if (shopInfo.length) {
      shop_name = $(shopInfo).find('div').eq(0).find('div._3Lybjn').text().trim()
      shop_url = window.location.host + $(shopInfo).find('div').eq(0).find('a').attr('href')
      shop_start = common.formatNumber($(shopInfo).find('div._3mK1I2').find('._1rsHot.OuQDPE').eq(0).text().trim().replace(/k|K/g, '000'))
    }
    const info = {
      shop_name,
      shop_url: 'https://' + shop_url, // 店铺url
      shop_start, // 店铺星级
      user_rating: '', // 用户评分
      after_service: '', // 售后服务
      customer_service: '', // 服务评分
      logistics: '', // 物流评分
      dispute: '',
      violation: '',  // 违规
      description: '' // 描述
    }
    return info
  },
  readySpider() {
    this.resetStatus($('._3a2wD-').find('.flex.flex-column>div').eq(0).find('>div button:visible'), 'tb-selected')
    this.resetStatus($('._3a2wD-').find('.flex.flex-column>div').eq(1).find('>div button:visible'), 'tb-selected')
  },
  // 重置点击状态、以方便取数据
  resetStatus(list, className) {
    list.each((i, v) => {
      if ($(v).hasClass(className)) {
        $(v).click()
      }
    })
  },
  /**
   * @description: 获取品牌信息
   */
  getBrandInfo() {
    const trElement = $('.page-product__content ._2C2YFD ._2aZyWI')
    let brand = '', index = 0
    while (index < trElement.find('div.kIo6pj').length) {
      if (['品牌', 'Brand', 'Merek', 'Thương hiệu','ยี่ห้อ'].includes(trElement.find('div.kIo6pj').eq(index).find('label').text().trim())) {
        if (trElement.find('div.kIo6pj').eq(index).find('div').length) {
          brand = trElement.find('div.kIo6pj').eq(index).find('div').text().trim()
        }
        if (trElement.find('div.kIo6pj').eq(index).find('a').length) {
          brand = trElement.find('div.kIo6pj').eq(index).find('a').text().trim()
        }
      }
      index++
    }
    return brand
  },

  /**
   * @description: 获取视频地址
   */
  getVideo() {
    let src = ''
    if ($('.product-briefing.flex.card._2cRTS4 video').length && $('.product-briefing.flex.card._2cRTS4 video').attr('src')) {
      src = $('.product-briefing.flex.card._2cRTS4 video').attr('src')
    }
    return src
  }
}