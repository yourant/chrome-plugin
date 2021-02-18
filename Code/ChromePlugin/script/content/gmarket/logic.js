var gmarketLogic = {
  // 类目
  fetchCategory() {
    const cat = {
      category_id: [],
      category_name: []
    }
    $('.location-navi .loc-catewrap').each((i, el) => {
      const pre = $(el).prev('a')
      if (i === 0) {
        cat.category_id.push(pre.attr('href').match(/L?\d+/)[0])
      } else {
        cat.category_id.push(pre.attr('href').match(/\d+/)[0])
      }
      cat.category_name.push(pre.text().trim())
    })
    return {
      category_id: cat.category_id[cat.category_id.length - 1],
      category_tree: cat.category_id,
      category_name: cat.category_name.join('>')
    }
  },
  // 获取店铺
  fetchShop() {
    const shop = {
      shop_name: '',
      shop_url: '',
      shop_start: '',
      user_rating: '',
      rating_user_num: '',
      after_service: '',
      customer_service: '',
      logistics: '',
      violation: '',
      description: ''
    }
    if ($('#shop_info_div .shop-title').length) {
      shop.shop_name = $('#shop_info_div .shop-title a').text().trim()
      shop.shop_url = $('#shop_info_div .shop-title a').attr('href').includes('http') ? $('#shop_info_div .shop-title a').attr('href') : 'https' + $('#shop_info_div .shop-title a').attr('href')
    } else if ($('#shop_info_div .shop-smiledelivery').length) {
      shop.shop_name = $('#shop_info_div .shop-smiledelivery .smiledelirvey-logo').text().trim()
      shop.shop_url = $('#shop_info_div .shop-smiledelivery a').attr('href')
    }
    return shop
  },
  fetchMainImage(baseObj) {
    const list = []
    list.push(baseObj['BigImageUrl'])
    baseObj['MoreImages'].forEach(v => {
      list.push(v['FullExLargeImagePath'])
    })
    return list
  },
  // 图文详情
  fetchDetails(fetchDesc) {
    const details = {
      params: [],
      images: fetchDesc.images,
      description: common.formatScript(fetchDesc.description)
    }
    // params
    $('#vip-tab_detail .box__product-notice-list tr').each((i, el) => {
      if ($(el).children.length === 2) {
        if ($(el).find('th').text().trim() && $(el).find('td').text().trim()) {
          details.params.push({
            key: $(el).find('th').text().trim(),
            value: $(el).find('td').text().trim()
          })
        }
      }
    })
    return details
  },
  fetchAttribute(val) {
    let str = $('html').html()
    str = str.slice(str.search(/GmktItem\.OptionParamCoreAbove\.combOptionObj\s=\s([\w\W]+)GmktItem\.OrderLimitCntGroup/))
    str = str.slice(0, str.search(/\}\s/) + 2)
    const base_price = String(Number(document.querySelector('.price_real').innerText.replace(/\D/g, '')).toFixed(2))
    const origin_price = String(Number($('.price_original').text().replace(/\D/g, '')).toFixed(2))
    const specificsList = []
    // 单品

    if (str.indexOf('GmktItem.OptionParamCoreAbove.combOptionObj = null') !== -1) {
      specificsList.push({
        specifics: [],
        product_no: val,
        stock_num: 0,
        images: [],
        shipping: {
          delivery: $('.delivery-tag').text().trim(),
          delivery_time: '',
          start_arrivals: ''
        },
        product_weight: 0,
        price: {
          original_price: origin_price || '0.00',
          selling_price: base_price
          // flash_price: '0.00',
          // happy_price: '0.00',
          // member_price: '0.00',
          // promotion_price: '0.00',
          // spike_price: '0.00'
        }
      })
    } else {
      // vary
      optionsObj = JSON.parse(str.replace(/GmktItem.OptionParamCoreAbove.combOptionObj\s+=\s+/, ''))
      console.log(optionsObj)
      let { OptionDepth } = optionsObj
      for (let i = 0; i < optionsObj[`CombinationalOptionData${ OptionDepth }`].OptionValues.length; i++) {
        let specifics = []
        for (let k = 1; k <= OptionDepth; k++) {
          specifics.push({
            key: optionsObj[`CombinationalOptionData${ k }`].OptionName,
            value: optionsObj[`CombinationalOptionData${ k }`].OptionValues[k][`OptionValue${ k }`]
          })
        }
        specificsList.push({
          specifics,
          product_no: optionsObj[`CombinationalOptionData${ OptionDepth }`].OptionValues[i].OptionNo,
          stock_num: optionsObj[`CombinationalOptionData${ OptionDepth }`].OptionValues[i].InventoryCount,
          images: [],
          shipping: {
            delivery: $('.delivery-tag').text().trim(),
            delivery_time: '',
            start_arrivals: ''
          },
          product_weight: 0,
          price: {
            original_price: origin_price || '0.00',
            selling_price: base_price + Number(optionsObj[`CombinationalOptionData${ OptionDepth }`].OptionValues[i].OptionPrice)
            // flash_price: '0.00',
            // happy_price: '0.00',
            // member_price: '0.00',
            // promotion_price: '0.00',
            // spike_price: '0.00'
          }
        })
      }
    }
    return specificsList
  }
}