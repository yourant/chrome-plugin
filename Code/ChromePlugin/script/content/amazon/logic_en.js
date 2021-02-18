const AmazonLogic = {
  main_images: [],
  getProductName() {
    return $('#productTitle').text().replace(/收藏/g,'').replace(/[\n\r↵]/g, '').trim().replace(/已收藏/g,'') || $('.feature_Title').text().replace(/收藏/g,'').replace(/[\n\r↵]/g, '').trim().replace(/已收藏/g,'')
  },
  fetchCategory() {
    if (!$('#wayfinding-breadcrumbs_feature_div').length) {
      return {
        is_details: false
      }
    }
    const cat = {
      category_id: 0,
      category_name: '',
      category_tree: [],
      is_details: true
    }
    let treeList = null, category_name = []
    if ($('#wayfinding-breadcrumbs_feature_div ul li:not(li.a-breadcrumb-divider)').length) {
      treeList = $('#wayfinding-breadcrumbs_feature_div ul li:not(li.a-breadcrumb-divider) a')
      treeList.each((index, el) => {
        // if (index) {
        const catArr = el.href.split('&')
        catArr.forEach(item => {
          if (item.indexOf('node=') !== -1) {
            cat.category_tree.push(item.split('=')[1])
          }
        })
        category_name.push($(el).text().trim())
        // }
      })
      cat.category_name = category_name.length ? category_name.join('>') : ''
      cat.category_id = Number(cat.category_tree[cat.category_tree.length - 1]) || 0
    } else if ($('#nav-subnav a:first-child').length) {
      cat.category_id = Number($('#nav-subnav a:first-child')[0].href.match(/\d{2,}/g)[0])
      cat.category_name = $('#nav-subnav a:first-child')[0].innerText
      cat.category_tree = [Number($('#nav-subnav a:first-child')[0].href.match(/\d{2,}/g)[0])]
    }
    return cat
  },
  /**
   * @description: 获取左侧栏主图
   */

  getImages(images) {
    // let images = []
    // if (attributes.length) {
    // 		attributes.map((item, index) => {
    // 				images = [...new Set(images.concat(item.images))]
    // 		})
    // }
    return images
  },

  // 区分url地址截取总评数
  getCommentPercent() {
    if ($('#productDetails_db_sections #averageCustomerReviews')) {
      console.log('第一种结构')
      // 日本站
      let str = ''
      if (location.href.indexOf('amazon.co.jp') !== -1) {
        str = $('#productDetails_db_sections #averageCustomerReviews').text().trim().split('\n')[0].slice(-3)
      } else if (location.href.indexOf('www.amazon.co.uk/') !== -1 || $($('#reviewsMedley div div div+div')[0]).find('span').eq(2).text()) {
        // de站点评分为 4,8
        str = $($('#reviewsMedley div div div+div')[0]).find('span').eq(2).text().slice(0, 3).replace(',', '.')
      } else {
        str = $('#productDetails_db_sections #averageCustomerReviews').text().trim().slice(0, 3)
      }
      return Number(str)
    }
    if ($('#productDetails_detailBullets_sections1 #averageCustomerReviews')) {
      console.log('第二种结构')
      let str = $('#productDetails_detailBullets_sections1 #averageCustomerReviews').text().trim().slice(0, 3)
      return Number('str')
    }
    console.log('return 0')
    return 0
  },
  /**
   * @description: 评论相关
   */
  getEvaluation() {
    const total_sales = -1
    const total_comment = -1
    const good_comment = -1
    const comment_percent = -1
    return {
      total_sales,
      total_comment,
      good_comment,
      comment_percent
    }
  },
  /**
   * @description: 获取上架时间
   */
  getPutawayTime() {
    let str = ''
    if ($('#detail-bullets_feature_div').length) {
      let liList = $('#detail-bullets_feature_div .content ul li')
      let index = 0
      while (index < $(liList).length) {
        if ($(liList).eq(index).text().indexOf('es desde') > -1) {
          str = $(liList).eq(index).text().split(':')[1]
        }
        index++
      }

    } else if ($('#prodDetails').length) {
      str = $('#prodDetails .date-first-available .value').text().trim() // 上架时间(新增字段)
    } else {

      let liList = $('#productDetailsTable .content ul li')
      let index = 0
      while (index < $(liList).length) {
        if ($(liList).eq(index).text().indexOf('es desde') > -1) {
          str = $(liList).eq(index).text().split(':')[1]
        }
        index++
      }
    }
    return str
  },
  /**
   * @description: 获取单品信息
   */
  getSingleAttr() {

  },

  /**
   * @description: 获取product_no
   */
  getProductNo() {
    const url = window.location.href
    let product_no = ''
    if ($('#ASIN').length) {
      product_no = $('#ASIN').val()
    } else if ($('#averageCustomerReviews').length) {
      product_no = $('#averageCustomerReviews').attr('data-asin')
    } else if ($('input[name="askAsin"]').val()) {
      product_no = $('input[name="askAsin"]').val()
    }
    return product_no
  },
  /**
   * @description: 获取区分项
   */

  async getSpecifics() {
    let arr = []
    arr.push({
      specifics: [],
      price: this.getPrice(),
      stock_num: '',
      images: [],
      product_no: this.getProductNo()
    })
    return arr
  },

  /**
   * @description: 获取价格
   */
  getPrice() {
    return {
      selling_price: '0.00',  // 售价
      original_price: '0.00' // 原价
    }
  },

  /**
   * @description: 获取运费、物流
   */
  getShipping() {
    let price = '0.00', delivery_time = ''
    let delivery = $('#mod-detail-bd .obj-carriage .cost-entries-type').length ?
      $('#mod-detail-bd .obj-carriage .cost-entries-type').find('p').text().trim() :
      $('#mod-detail-bd .obj-carriage').find('div').find('span').eq(0).text().trim()
    if (!delivery) {
      if ($('#shippingMessageInsideBuyBox_feature_div span').length) {
        delivery = $('#shippingMessageInsideBuyBox_feature_div span')[0].innerText.trim()
      }
    }
    delivery = delivery || $('#deliveryMessageMirId a').text().replace(':', '')
    price = delivery.match(/\d+\.?\d*/) ? delivery.match(/\d+\.?\d*/)[0] : '0.00'
    // if (location.href.indexOf('www.amazon.co.jp') !== -1) {
    //   // 日本站特殊处理
    //   console.log($('#dynamicDeliveryMessage'))
    //   delivery = $('#dynamicDeliveryMessage').text()
    //   delivery_time = $('#dynamicDeliveryMessage').text().split(':')[1]
    //   price = $('#dynamicDeliveryMessage').text().split(':')[0].replace(/[^\d.]/g, '')
    // }
    return {
      start_arrivals: '',
      delivery: '',
      delivery_time: $('#dynamicDeliveryMessage').text().trim().replace(/\n/g, ''),
      price
    }
  },
  /**
   * @description: 获取sku图片列表
   */
  getSkuImages() {
    const arr = []
    const altImages = $('#altImages ul li')
    let index = 0
    while (index < $(altImages).length) {
      if (![0, 1].includes(index)) {
        let src = $(altImages).eq(index).find('img').length ? common.formatSrc($(altImages).eq(index).find('img').attr('src').trim()) : ''
        if (src && (src.indexOf('PKmb-play-button-overlay-thumb') === -1 || src.indexOf('.gif') === -1 || src.indexOf('play-icon-overlay') === -1)) {
          arr.push(src.replace(/_[^\s]+_/g, '_AC_US800_'))
        }
      }
      index++
    }
    return arr.filter(Boolean)
  },

  /**
   * @description: 获取库存
   */
  getStockNum() {
    let val = 0
    val = $('#quantity option').length ? $('#quantity option').eq($('#quantity option').length - 1).val().trim() : '0'
    return val
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
    // detailBullets_feature_div
    let description = '', product_information = '', images = []
    if ($('#aplus>div').length) {
      description += common.formatSrc($('#aplus>div').html().trim())
    }
    if ($('#productDescription_feature_div').length) {
      description += common.formatSrc($('#productDescription_feature_div').html().trim())
    }
    if ($('#detailBullets_feature_div').length) {
      description += common.formatSrc($('#detailBullets_feature_div').html().trim())
    }
    if ($('#prodDetails>div').length) {
      description += '\n' + common.formatSrc($('#prodDetails>div').html().trim().replace(/(↵|\r\n)+\s+/g, '').replace(/\"/g, '\'').replace(/\n+/, '').replace(/\?+/g, '.'))
    }
    $('#productDescription_feature_div img').each((i, v) => {
      if ($(v).hasClass('a-lazy-loaded')) {
        images.push(common.formatSrc($(v).attr('data-src')))
      } else {
        images.push(common.formatSrc($(v).attr('src')))
      }
    })
    $('#detailBullets_feature_div img').each((i, v) => {
      if ($(v).hasClass('a-lazy-loaded')) {
        images.push(common.formatSrc($(v).attr('data-src')))
      } else {
        images.push(common.formatSrc($(v).attr('src')))
      }
    })
    $('#aplus img').each((i, v) => {
      if ($(v).hasClass('a-lazy-loaded')) {
        images.push(common.formatSrc($(v).attr('data-src')))
      } else {
        images.push(common.formatSrc($(v).attr('src')))
      }
    })
    $('#prodDetails img').each((i, v) => {
      if ($(v).hasClass('a-lazy-loaded')) {
        images.push(common.formatSrc($(v).attr('data-src')))
      } else {
        images.push(common.formatSrc($(v).attr('src')))
      }
    })
    // product_information = common.formatSrc($('#aplus').html().trim().replace(/(↵|\r\n)+\s+/g, '').replace(/\"/g, '\'').replace(/\n+/, '').replace(/\?+/g, '.'))
    description = common.formatSrc(description.replace(/(↵|\r\n)+\s+/g, '').replace(/\"/g, '\'').replace(/\n+/, '').replace(/\?+/g, '.')).replace(/[\n↵\r]+/g, '')
    const detail = {
      params: [],
      images: [],
      feature_bullets: await this.getFeatureBullets(),
      sale_rank: [],
      description,
      product_information
    }
    return detail
  },
  /**
   * @description: 商品排名
   */
  getSaleRank() {
    let sale_rank = [], that = this
    let saleRankList = [], salearr = []
    const filterArr = common.filterSaleRank
    let is_uk = false
    if ($('#dpx-amazon-sales-rank_feature_div ul li').length) {
      console.log('第一种情况')
      saleRankList = $('#dpx-amazon-sales-rank_feature_div ul li')
    } else if ($('#detailBulletsWrapper_feature_div>ul>li').length) {
      console.log('第二种情况')
      saleRankList = $('#detailBulletsWrapper_feature_div>ul>li')
    } else if ($('#SalesRank').length) {
      console.log('第三种情况')
      saleRankList = $('#SalesRank ul li')
    } else if ($('#detailBullets_feature_div ul.detail-bullet-list').length) {
      console.log('第四种情况')
      saleRankList = $('#detailBullets_feature_div ul').eq(1).find('li').eq(0)
    } else {
      console.log('第五种情况')
      $('#productDetails_detailBullets_sections1 tbody tr').each((index, el) => {
        if ($(el).find('th').text() && filterArr.includes($(el).find('th').text().trim())) {
          if (/\sin\s|\sen\s|\sem\s/.test($(el).find('td').text().trim())) {
            saleRankList = $(el).find('td').find('span>span')
            is_uk = true
          }
        }
      })
    }
    // const saleList = $('#productDetails_detailBullets_sections1 tr:nth-child(3) td:nth-child(2)').find('span')
    // 品类排名
    if (saleRankList.length) {
      if (is_uk) {
        let index = 0
        while (index < saleRankList.length) {
          sale_rank.push({
            key: $(saleRankList[index]).text().split(/\sin\s|\sen\s|\sem\s/g)[1].split('(')[0].trim(),
            value: $(saleRankList[index]).text().split(/\sin\s|\sen\s|\sem\s/g)[0].trim()
          })
          index++
        }
      } else {
        let index = 0
        while (index < saleRankList.length) {
          let text = null
          if (index === 1) {
            text = $(saleRankList).eq(0).find('span.a-list-item>ul>li>span').text().trim().split(/\sin\s|\sen\s|\sem\s/g)
          } else {
            text = $(saleRankList).eq(index).find('span.a-list-item').length ?
              $(saleRankList).eq(index).find('span.a-list-item').text().trim().split(/\sin\s|\sen\s|\sem\s/g) :
              $(saleRankList).eq(index).text().trim().split(/\sin\s|\sen\s|\sem\s/g)
          }
          if (text.length && text[1]) {
            sale_rank.push({
              key: text[1].includes('(') ? text[1].slice(1, text[1].indexOf('(') - 1) : text[1].slice(1),
              value: text[0].replace(/[^0-9]/g, '')
            })
          }
          index++
        }
      }
    }
    // 平台排名
    const str = $('#SalesRank').text().trim()
    let strs = '', strsArr = []
    strsArr = str.split(/\sin\s|\sen\s|\sem\s/g)
    if (strsArr.length) {
      sale_rank.push({
        key: strsArr.includes('(') ? strsArr[1].slice(1, strsArr[1].indexOf('(') - 1) : strsArr.slice(1),
        value: strsArr[0].replace(/[^0-9]/g, '')
      })
    }
    sale_rank = common.deleteEmptyProperty(sale_rank)
    sale_rank = sale_rank.map(v => {
      console.log(v)
      return {
        key: v['key'],
        value: v.value.replace(/[^\d]/g, '')
      }
    })
    return sale_rank
  },

  /**
   * @description: 获取商品功能属性
   */
  async getFeatureBullets() {
    const arr = []
    const featureBullets = $('#feature-bullets ul li')
    await common.delay(500)
    if ($('#feature-bullets div a').length) {
      $('#feature-bullets div a')[0].click()
    }
    let index = 0
    while (index < $(featureBullets).length) {
      if ($(featureBullets).eq(index).attr('id')) {
        index++
        continue
      }
      arr.push($(featureBullets).eq(index).find('span').text().trim())
      index++
    }
    $('#productDescription p').each((i, v) => {
      arr.push($(v).text())
    })
    return arr
  },

  /**
   * @description: 获取详情params
   */
  getDetailParams() {
    // technicalSpecifications_section_1
    const arr = []
    const paramsList = $('#detail-bullets_feature_div ul li').length ? $('#detail-bullets_feature_div ul li') : $('#detailBullets_feature_div ul li')
    let index = 0
    if (paramsList.length > 0) {
      while (index < $(paramsList).length) {
        arr.push({
          key: common.formatText($(paramsList).eq(index).text().replace('::', ':').trim().split(':')[0]),
          value: common.formatText($(paramsList).eq(index).text().replace('::', ':').trim().split(':')[1])
        })
        index++
      }
      return common.deleteEmptyProperty(arr)
    } else {
      let productDetails = null
      if ($('#technicalSpecifications_section_1').length) {
        productDetails = $('#technicalSpecifications_section_1 tbody tr')
      } else if ($('#prodDetails').length) {
        if ($('#prodDetails table#productDetails_techSpec_section_1 tr').length) {
          productDetails = $('#prodDetails table#productDetails_techSpec_section_1 tr')
        }
        if ($('#prodDetails table#productDetails_detailBullets_sections1 tr').length) {
          productDetails = $('#prodDetails table#productDetails_detailBullets_sections1 tr')
        }
      }

      while (index < $(productDetails).length) {
        arr.push({
          key: common.formatText($(productDetails).eq(index).find('th').text().trim()) ? common.formatText($(productDetails).eq(index).find('th').text().trim()) : common.formatText($(productDetails).eq(index).find('td').eq(0).text().trim()),
          value: common.formatText($(productDetails).eq(index).find('th').text().trim()) ? common.formatText($(productDetails).eq(index).find('td').text().trim()) : common.formatText($(productDetails).eq(index).find('td').eq(1).text().trim())
        })
        index++
      }
      return common.deleteEmptyProperty(arr)

    }
  },

  /**
   * @description: 获取店铺信息
   */
  getShopInfo() {
    const info = {
      shop_name: '',
      shop_url: '' // 店铺url
    }
    return info
  },
  /**
   * @description: 获取品牌名
   */
  getBrand() {
    return ''
  },

  /**
   * @description: 获取视频
   */
  getVideo() {
    let video = null, src = ''
    if ($('#ivVideoBlock').length) {
      video = $('#ivVideoBlock video')
    } else if ($('video.lib-video').length) {
      video = $('video.lib-video')
    } else if ($('.content-grid-row-wrapper video')) {
      video = $('.content-grid-row-wrapper video')
    }
    if (video && video.length) {
      src = video.attr('src')
    }
    return src
  },

  /**
   * @description: 初始化所有规格
   */
  initSpecifics() {
    $('#variation_style_name ul li').eq(0).find('button').click()
    $('#variation_color_name ul li').eq(0).find('button').click()
    $('#variation_size_name ul li').eq(0).find('button').click()
  }
}