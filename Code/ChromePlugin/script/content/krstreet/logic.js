// 监听有关background,popups的信息
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.code) {
    case 'desc': {
      Kr11streetLogic.fetchDesc = {
        has: true,
        ...request.data
      }
    }
    break
  default: {}
  }
  sendResponse('')
})
const urlStr = window.location.href
const Kr11streetLogic = {
  main_images: [],
  fetchDesc: {
    has: false,
    description: '',
    images: []
  },
  /** 
   * @description: 获取标题
   */
  getProductName() {
    let el = null, title = ''
    if ($('.prdc_heading_v2 .heading h2').length) {
      el = $('.prdc_heading_v2 .heading h2')
    } else if ($('.c_product_info_title h1').length) {
      el = $('.c_product_info_title h1')
    }
    if (el) {
      title = el.text().trim()
    }
    return  title
  },
  /** 
   * @description: 获取product no
   */
  getProductNo() {
    let product_no = ''
    const url = urlStr.split('?')[0]
    product_no = url.slice(url.lastIndexOf('/') + 1)
    return product_no
  },
  /** 
   * @description: 获取收藏数
   */
  getFavorite() {
    return $('#likeAdd strong').length ? Number($('#likeAdd strong').text().trim()) : 0
  },
  /** 
   * @description: 获取评论数
   */
  getComment() {
    const total_comment = $('#prdReviewCnt strong').length ? $('#prdReviewCnt strong').text().match(/\d+/)[0] : ''
    const good_comment = $('#prdRating').length ? $('#prdRating .num').text().trim() : ''
    return { total_comment, good_comment }
  },
  // 获取主图
  fetchMainImage() {
    let element = null, video = ''
    const main_image = []
    // smallImg
    if ($('#prdcSmaillimg').length) {
      element = $('#prdcSmaillimg img')
    } else if ($('#smallImg ul li').length) {
      element = $('#smallImg ul li')
    }
    if (element) {
      element.each((i, el) => {
        if ($(el).hasClass('type_video')) {
          video = common.formatSrc($('#video-box source').attr('src'))
        } else {
          let src = common.formatSrc($(el).find('img').attr('src').replace(/\d+x\d+/, '1000x1000'))
          main_image.push(src)
        }
      })
    }
    return { main_image, video }
  },
  // 获取目录
  fetchCategory() {
    const cat = {
      category_id: 0,
      category_name: '',
      category_tree: []
    }
    let element = null, category_name = []
    if ($('.c_product_category_path ol').length) {
      element = $('.c_product_category_path ol li')
    }
    element.each((index, el) => {
      if (index) {
        if ($(el).hasClass('active')) {
          // let name = $(el).text().trim()
          // if (name) {
          //   category_name.push(name)
          // }
          let treeStr = $(el).find('button').attr('link-url')
          let id = treeStr.split('?')[1].split('=').map(v => v.replace(/[^0-9]/g, ''))
          if (id.length) {
            cat.category_tree.push(id.filter(v => v.length > 4)[0])
          }
        } else {
          let name = $(el).find('em.selected').text().trim()
          if (name) {
            category_name.push(name)
          }
        }
      }
    })
    category_name = category_name.filter(Boolean) // 过滤空数据
    cat.category_name = category_name.length ? category_name.join('>') : ''
    cat.category_id = Number(cat.category_tree[cat.category_tree.length - 1]) || 0
    return cat
  },
  // 获取店铺
  fetchShop() {
    let shopEl = null, infoEl = null
    if ($('.b_product_seller').length) {
      shopEl = $('.b_product_seller .c_product_seller_title')
    }
    if ($('.info_cont').length) {
      infoEl = $('.info_cont')
    }
    let shop_start = '', user_rating = '', after_service = ''
    if (infoEl) {
      user_rating = infoEl.find('dd').eq(0).text().trim()
      after_service = infoEl.find('dd').eq(1).text().trim()
      shop_start = infoEl.find('dd').eq(2).find('em').text().trim().replace(/[^0-9]/g, '')
    }
    const info = {
      shop_name: shopEl ? shopEl.text().trim() : '',
      shop_url: shopEl ? common.formatSrc(shopEl.find('a').attr('href')) : '', // 店铺url
      shop_start, // 店铺星级
      user_rating, // 用户评分
      after_service, // 售后服务
      customer_service: '', // 服务评分
      logistics: '', // 物流评分
      dispute: '',
      violation: '',  // 违规
      description: '' // 描述
    }
    return info
  },
  // 获取详情
  fetchDetails() {
    let detailEl = null, description = ''
    description = this.fetchDesc.description.replace(/(↵|\r\n)+\s+/g, '').replace(/\"/g, '\'').replace(/\n+/, '').replace(/\?+/g, '.')
    description = common.formatScript(common.formatSrc(description))
    const details = {
      params: [],
      images: this.fetchDesc.images,
      description
    }
    let brand = ''
    $('#tabpanelDetail1 .prdc_detail_table tr').each((i, el) => {
      let th = $(el).find('th')
      let td = $(el).find('td')
      if (el.innerText.trim() === '브랜드') {
        brand = th.text().trim()
      }
      details.params.push({
        key: th.text().trim(),
        value: th.text().trim()
      })
    })
    return { details, brand }
  },
  /** 
   * @description: 获取区分项
   */
  async getSpecifics() {
    let arr = [], buyList = null, arr1 = [], arr2 = [], arr3 = []
    let baseData = {
      specifics: [],
      shipping: this.getShipping(),
      price: {
        selling_price: '0.00',  // 售价
        original_price: '0.00' // 原价
        // spike_price: '0.00',
        // member_price: '0.00',
        // promotion_price: '0.00',
        // flash_price: '0.00',
        // happy_price: '0.00'
      },
      stock_num: 0,
      product_weight: '',
      packing: '',
      images: [],
      product_no: this.getProductNo()
    }
    const shipping = this.getShipping(),
          product_weight = '',
          packing = '',
          images = []
    buyList = $('#buyList>li').length ? $('#buyList>li') : []
    if (!buyList.length || $('#buyList').is(':hidden')) {
      console.log('递归区分项')
      arr = await this.fetchAttribute()
    } else {
      // 获取第一个元素标签
      // const list1 = buyList.eq(0).find('ul>li').eq(0) || []
      if (!buyList.eq(0).find('div.active')) {
        buyList.eq(0).find('button.btn').click()
        if (!buyList.eq(1).find('ul>li').find('div.active')) {
          buyList.eq(1).find('ul>li').eq(0).find('button.btn').click()
        } else {
          buyList.eq(1).find('ul>li').eq(0).find('div').click()
        }
      } else {
        buyList.eq(0).find('ul>li').eq(0).find('div').eq(0).click()
        await common.delay(2000)
      }
      await common.delay(2000)
      let list1 = null
      if (buyList.eq(1).find('ul>li:not(.c_product_option_item)').eq(0).find('ul>li').length) {
        list1 = buyList.eq(1).find('ul>li:not(.c_product_option_item)').eq(0).find('ul>li')
      } else if (buyList.eq(1).find('ul>li').length) {
        list1 = buyList.eq(1).find('ul>li')
      }
      if (list1 && list1.length) {
        list1.each((ind, el) => {
          let selling_price = $(el).find('div').attr('data-price') ?
              $(el).find('div').attr('data-price') : 
              $('.price_wrap li').length ? $('.price_wrap li').eq(0).find('.price .value').text().trim() : '0.00',
              original_price = $('.price_regular').length ? $('.price_regular .value').text().trim() : '0.00'
          if ($(el).parent().parent().parent().find('input[name="botOptTitle"]').length) {
            let obj = {
              obj: {
                key: $(el).parent().parent().parent().find('input[name="botOptTitle"]').val().trim(),
                value: $(el).find('strong').text().trim()
              },
              shipping,
              product_weight,
              packing,
              images,
              product_no: this.getProductNo(),
              stock_num: $(el).find('div').attr('data-stckqty') || 0,
              price: {
                selling_price: selling_price || original_price || '0.00',
                original_price
                // spike_price: '0.00',
                // member_price: '0.00',
                // promotion_price: '0.00',
                // flash_price: '0.00',
                // happy_price: '0.00'
              }
            }
            arr1.push(obj)
          }
        })
        // console.log('specifices:::', arr1)
        $(list1).eq(0).find('button').click()
        await common.delay(2000)
        // 第一个嵌套的第二个子或者跟第一个平级的兄弟
        let list1_2 = null
        if (buyList.eq(1).find('ul>li:not(.c_product_option_item)').length) {
          list1_2 = buyList.eq(1).find('ul>li:not(.c_product_option_item)').eq(1).find('ul>li')
          list1_2.each((ii, item) => {
            if (buyList.eq(1).find('ul>li:not(.c_product_option_item)').eq(1).find('input[name="botOptTitle"]').length) {
              let obj = {
                key: buyList.eq(1).find('ul>li:not(.c_product_option_item)').eq(1).find('input[name="botOptTitle"]').val().trim(),
                value: $(item).find('strong').text().trim()
              }
              arr2.push(obj)
            }
          })
        } else if (buyList.eq(2).find('ul>li').length) {
          list1_2 = buyList.eq(2).find('ul>li')
          list1_2.each((ii, item) => {
            if ($(item).parent().parent().parent().find('input[name="botOptTitle"]').length) {
              let obj = {
                key: $(item).parent().parent().parent().find('input[name="botOptTitle"]').val().trim(),
                value: $(item).find('strong').text().trim()
              }
              arr2.push(obj)
            }
          })
        }
      } else {
        console.log('single')
        const singleList = buyList.eq(0).find('ul>li')
        console.log('singleList', $(singleList).eq(0).find('div'))
        let selling_price = '0.00'
        if ($(singleList).eq(0).find('ul>li').length) {
          selling_price = $(singleList).eq(0).find('ul>li').eq(0).find('div').attr('data-price')
        } else if ($('.price_wrap li').length) {
          selling_price = $('.price_wrap li').eq(0).find('.price .value').text().trim()
        } else {
          selling_price = $(singleList).eq(0).attr('data-price')
        }
        const original_price = $('.price_regular').length ? $('.price_regular .value').text().trim() : '0.00'
        arr1.push({
          specifices: [],
          shipping,
          product_weight,
          packing,
          images,
          product_no: this.getProductNo(),
          stock_num: 0,
          price: {
            selling_price: selling_price || original_price || '0.00',
            original_price
            // spike_price: '0.00',
            // member_price: '0.00',
            // promotion_price: '0.00',
            // flash_price: '0.00',
            // happy_price: '0.00'
          }
        })
      }
      if (arr1.length) {
        arr1.map(v => {
          if (!arr2.length) {
            let list = []
            if (v.obj) {
              list.push(v.obj)
              v['specifices'] = list
            } else {
              v['specifices'] = []
            }
            arr.push(v)
          }
          arr2.map(vv => {
            let list = []
            if (v.obj) {
              list.push(v.obj)
              list.push(vv)
              v['specifices'] = list
            } else {
              v['specifices'] = []
            }
            arr.push(v)
          })
        })
      }
      arr.map(v => { return delete v.obj })
    }
    console.log(!arr.length)
    if (!arr.length && arr[0] === undefined) {
      const stock_num = $('.buy_list_inner ul').eq(1).find('li').attr('data-stckqty') || '0'
      const selling_price = $('.price_wrap li').eq(0).find('.price .value').text().trim() || '0.00'
      const original_price = $('.price_wrap li').eq(0).find('.price_regular .value').text().trim() || '0.00'
      baseData.price.selling_price = selling_price || original_price
      baseData.price.original_price = original_price
      baseData.stock_num = stock_num
      arr.push(baseData)
    }
    return arr
  },
  /** 
   * @description: 获取物流信息
   */
  getShipping() {
    return {
      start_arrivals: '',
      delivery: '',
      delivery_time: ''
    }
  },
  // vary 属性
  async fetchAttribute() {
    // 打开弹窗
    if ($('#ui_option1').length) {
      $('#ui_option1')[0].click()
    }
    // 几个分类项
    const attrLength = $('#ui_option_layer1 .op_list dt').length
    const obj = []
    await this.attrLoop(0, attrLength, obj)
    $('.close_btn').click()
    return obj
  },
  async attrLoop(start, length, obj) {
    for ( var i = 0; i < $('.ui_option_list').eq(start).find('a').length; i++) {
      if ($('#ui_option_layer1 .op_list dt').eq( start ).find('.opt_input').text().trim() ) {
        $('#ui_option_layer1 .op_list dt').eq(start).find('a')[ 0 ].click()
        await common.delay(1000)
      }
      $('.ui_option_list').eq(start).find('a').eq(i)[0].click()
      await common.delay(1000)
      if (start < length - 2) {
        let otherStart = start + 1
        await this.attrLoop(otherStart, length, obj)
      } else {
        const spc = []
        $('#ui_option_layer1 .op_list dt').each(( i, el) => {
          spc.push({
            key: $(el).find('.opt').text().trim(),
            value: $(el).find('.opt_input').text().trim()
          })
        })
        $('.ui_option_list').eq(start + 1).find('a').each(( index, el1) => {
          const spc1 = JSON.parse(JSON.stringify( spc ))
          spc1[length - 1].value = $(el1).attr('data-dtloptnm')
          obj.push({
            specifics: spc1,
            images: [],
            product_no: $(el1).attr('data-stckno'),
            price: {
              selling_price: $(el1).attr('data-price'),
              original_price: ''
            },
            stock_num: $(el1).attr('data-stckqty')
          })
        })
      }
    }
  }
}