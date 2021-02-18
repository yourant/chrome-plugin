const LazadaLogic = {
  /**
   * @description: 获取基础数据对象
   */
  getBaseInfo() {
    try{
      const scriptList = $('script')
      let obj = {}
      if (scriptList.length) {
        $(scriptList).each(function(i) {
          if ($(this).text().indexOf('window.LZD_RETCODE_PAGENAME = \'pdp-pc-revamp\'') != -1) {
            let text = $(this).text().replace(/\r\n|\s{2,}/g, ''), str = ''
            const start_len = 'var __moduleData__ = '
            const end_len = ';var __googleBot__ ='
            if (text.indexOf('promotionTags') !== -1) {
              str = text.slice(text.indexOf(start_len) + start_len.length, text.indexOf(end_len))
            }
            Object.assign(obj, JSON.parse(str, null, '\t'))
          }
        })
      }
      // console.log('**********************script data start*****************')
      // console.log(obj)
      // console.log(JSON.stringify(obj))
      // console.log('**********************script data end *******************')
      return obj
    }catch (e) {
      console.log('error',e)
    }
  },
  getSkuId() {
    const url = window.location.href
    return url.slice(url.lastIndexOf('-s') + 2, url.lastIndexOf('.html'))
  },
  getProductNo() {
    const url = window.location.href
    return url.slice(url.lastIndexOf('-i') + 2, url.lastIndexOf('-s'))
  },

  /**
   * @description: 标题
   */
  getProductTitle() {
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    return baseData['data']['root']['fields']['product']['title'] || ''
  },
  fetchCategory() {
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    const categoryObj = baseData['data']['root']['fields']['skuInfos']
    let cat = {
      category_id: 0,
      category_name: '',
      category_tree: []
    }
    let category_name = []
    // 通过skuid来获取对应的目录结构
    for (let item in categoryObj) {
      if (item === skuId) {
        let category = categoryObj[skuId]
        category_name = category['dataLayer']['pdt_category']
        cat.category_id = category['categoryId']
        cat.category_tree.push(category['categoryId'])
      }
    }
    cat.category_name = category_name.join('>')
    return cat
  },
  getEvaluation() {
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    let images = []
    const commentObj = baseData['data']['root']['fields']['review']
    let total_sales = '', total_comment = '', good_comment = '', comment_percent = ''
    if (commentObj) {
      total_comment = commentObj['ratings']['rateCount'].toString() || ''
      good_comment = commentObj['ratings']['reviewCount'].toString() || ''
      comment_percent = commentObj['ratings']['average'].toString() || ''
    }
    return {
      total_sales,
      total_comment,
      good_comment,
      comment_percent
    }
  },

  /**
   * @description: 获取主图
   */
  getMainImages() {
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    let images = [], video = ''
    const imagesObj = baseData['data']['root']['fields']['skuGalleries']
    for (let item in imagesObj) {
      if (item === skuId) {
        let imagesList = imagesObj[skuId]
        imagesList.map(v => {
          if (v.type === 'img') {
            images.push(common.formatSrc(v.src))
          } else {
            video = common.formatSrc(v.src)
          }
        })
      }
    }
    const main_image = Array.from(new Set(images)).filter(v => v) || []
    return { video, main_image }
  },

  /**
   * @description: 获取品牌
   */
  getBrand() {
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    return baseData['data']['root']['fields']['product']['brand']['name'] || ''
  },
  /**
   * @description: 获取详情
   */
  async getDetails() {
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    let description = '', images = [], params = [], packing = ''
    // detail_decorate_root
    description = baseData['data']['root']['fields']['product']['desc'] ?
        baseData['data']['root']['fields']['product']['desc'] :
        $('#detail_decorate_root').length ?
            $('#detail_decorate_root').html().trim() : ''
    description = common.formatSrc(description.replace(/[\r\n↵]+/g, '').replace(/\"/g, '\'')).replace(/\s+/g, ' ')
    description.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function(match, capture) {
      images.push(common.formatSrc(capture))
    })
    images = Array.from(new Set(images)).filter(v => v) || []
    const paramsObj = baseData['data']['root']['fields']['specifications']
    for (let item in paramsObj) {
      if (item === skuId) {
        const param = paramsObj[skuId]['features']
        for (let it in param) {
          params.push({
            key: it,
            value: param[it]
          })
        }
      }
    }
    return { params, images, description, packing }
  },
  getPrice() {
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    const skuList = baseData['data']['root']['fields']['skuInfos']
    // const productInfoEl = $('.product-info')
    const obj = {
      price: {
        selling_price: '0.00',
        original_price: '0.00'
        // spike_price: '0.00',
        // member_price: '0.00',
        // promotion_price: '0.00',
        // flash_price: '0.00',
        // happy_price: '0.00'
      },
      stock_num: '0'
    }
    console.log(skuList)
    for (let item in skuList) {
      if (Number(item)) {
        console.log(skuList[item]['price'])
        obj.price.selling_price = skuList[item]['price'] ? skuList[item]['price']['salePrice']['value'].toString() : '0.00'
        obj.price.original_price = skuList[item]['originalPrice'] ? skuList[item]['price']['originalPrice']['value'].toString() : '0.00'
        obj.stock_num = skuList[item]['stock'] ? skuList[item]['stock'].toString() : '0'
      }
    }
    return obj
  },
  /**
   * @description: 获取运输方式
   */
  getDelivery() {
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    const deliveryOptions = baseData['data']['root']['fields']['deliveryOptions']
    let start_arrivals = '', // 发货地 无法取到
        delivery = '', // 运输方式
        delivery_time = '' // 配送时间
    for (let item in deliveryOptions) {
      if (item === skuId) {
        deliveryOptions[skuId].map(v => {
          if (v.badge) {
            start_arrivals = v['dataType'] || ''
            delivery = v['title'] || ''
            delivery_time = v['duringTime'] || ''
          }
        })
      }
    }
    return { start_arrivals, delivery, delivery_time }
  },

  /**
   * @description: 获取区分项
   */
  async fetchAttribute() {
    // 区分项小图 productOption.skuBase.properties
    // 主图skuGalleries
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    const specificsArr = baseData['data']['root']['fields']['productOption']['skuBase']['properties']
    const price = this.getPrice()
    const shipping = this.getDelivery()
    const that = this
    let attribute = [] // attribute 包含多个baseData结构
    let base = {
      shipping: shipping,
      ...price,
      // stock_num: $('.product-quantity-tip').length ? $('.product-quantity-tip').text().replace(/[^0-9]/ig, '') : '',
      product_weight: '',
      packing: '',
      product_no: this.getProductNo()
    }
    if (!specificsArr.length) {
      Object.assign(base, { specifics: [], images: [] })
      attribute.push(base)
    } else {
      const list1 = specificsArr[0] ? specificsArr[0].values : []
      const list2 = specificsArr[1] ? specificsArr[1].values : []
      const list3 = specificsArr[2] ? specificsArr[2].values : []
      if (list1.length) {
        list1.map(v => {
          if (!list2.length) {
            if (v.value && Array.isArray(v.value)) {
              v.value.map(k => {
                const innerSpecifc = {
                  specifics: [{ key: specificsArr[0].name, value: k.name }],
                  images: [common.formatSrc(v.image)].filter(v => v) || []
                }
                Object.assign(innerSpecifc, base)
                attribute.push(innerSpecifc)
              })
            } else {
              const innerSpecifc = {
                specifics: [{ key: specificsArr[0].name, value: v.name }],
                images: [common.formatSrc(v.image)].filter(v => v) || []
              }
              Object.assign(innerSpecifc, base)
              attribute.push(innerSpecifc)
            }
          }
          list2.map(vv => {
            if (!list3.length) {
              if (vv.value && Array.isArray(vv.value)) {
                vv.value.map(i => {
                  const innerSpecifc = {
                    specifics: [{ key: specificsArr[0].name, value: v.name }, { key: specificsArr[1].name, value: i.name }],
                    images: [common.formatSrc(v.image)].filter(v => v) || []
                  }
                  Object.assign(innerSpecifc, base)
                  attribute.push(innerSpecifc)
                })
              } else {
                const innerSpecifc = {
                  specifics: [{ key: specificsArr[0].name, value: v.name }, { key: specificsArr[1].name, value: vv.name }],
                  images: [common.formatSrc(v.image)].filter(v => v) || []
                }
                Object.assign(innerSpecifc, base)
                attribute.push(innerSpecifc)
              }
            }
            list3.map(vvv => {
              if (vvv.value && Array.isArray(vvv.value)) {
                vvv.value.map(j => {
                  const innerSpecifc = {
                    specifics: [{ key: specificsArr[0].name, value: v.name }, { key: specificsArr[1].name, value: vv.name }, { key: specificsArr[2].name, value: j.name }],
                    images: [common.formatSrc(vv.image)].filter(v => v) || []
                  }
                  Object.assign(innerSpecifc, base)
                  attribute.push(innerSpecifc)
                })
              } else {
                const innerSpecifc = {
                  specifics: [{ key: specificsArr[0].name, value: v.name }, { key: specificsArr[1].name, value: vv.name }, { key: specificsArr[2].name, value: vvv.name }],
                  images: vv.image ? [common.formatSrc(vv.image)].filter(v => v) : [common.formatSrc(v.image)].filter(v => v)
                }
                innerSpecifc.images = innerSpecifc.images || []
                Object.assign(innerSpecifc, base)
                attribute.push(innerSpecifc)
              }
            })
          })
        })
      }
    }
    return attribute
  },
  getShop() {
    const baseData = this.getBaseInfo()
    const skuId = this.getSkuId()
    const seller = baseData['data']['root']['fields']['seller']
    let shop_name = '', shop_url = '', customer_service = '', logistics = '', user_rating = ''
    if (seller) {
      shop_name = seller['name'] || ''
      shop_url = seller['url'] ? common.formatSrc(seller['url']) : ''
      logistics = seller['shipOnTime']['value'] ? seller['shipOnTime']['value'] : ''
      user_rating = seller['positiveSellerRating']['value'] ? seller['positiveSellerRating']['value'] : ''
      customer_service = seller['chatResponsiveRate']['value'] ? seller['chatResponsiveRate']['value'] : ''
    }
    return {
      shop_name, // 店名,
      shop_start: '',
      user_rating,
      after_service: '',
      customer_service, // 物流评分
      logistics, // 服务评分
      dispute: '',
      violation: '',
      shop_url,
      description: $('.dsr-above b').length ? $('.dsr-above b').text().trim() : '' // 描述评分
    }
  }
}