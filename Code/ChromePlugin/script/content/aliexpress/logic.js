var aliexpressLogic = {
  // 评论相关
  fetchComment(runParams) {
    const commentObj = runParams['titleModule']
    return {
      total_comment: commentObj['feedbackRating']['totalValidNum'],
      good_comment: commentObj['feedbackRating']['fiveStarNum'] + commentObj['feedbackRating']['fourStarNum'],
      comment_percent: commentObj['feedbackRating']['averageStarRage'],
      total_sales: commentObj['tradeCount']
    }
  },
  // 类目
  fetchCategory(runParams) {
    const arr = runParams.crossLinkModule.breadCrumbPathList
    const categoryTree = []
    const categoryName = []
    if (arr.length) {
      arr.forEach(v => {
        if (v.cateId) {
          categoryTree.push(v.cateId)
          categoryName.push(v.name)
        }
      })
    }
    return {
      category_id: runParams.commonModule.categoryId,
      category_tree: categoryTree,
      category_name: categoryName.join('>')
    }
  },
  // 属性
  async fetchAttribute(runParams) {
    let attribute = [] // attribute 包含多个baseData结构
    let list = []
    console.log(runParams)
    const skuList = runParams.skuModule.productSKUPropertyList
    // 手动拼接区分项数组 以避免原始数据顺序错乱问题
    if (skuList) {
      skuList[0].skuPropertyValues.forEach(v => {
        if (!skuList[1]) {
          list.push({
            specifics: [{ key: skuList[0].skuPropertyName, value: v.propertyValueDefinitionName || v.propertyValueName }],
            skuMapId: [v.propertyValueId],
            images: v.skuPropertyImagePath ? [common.formatSrc(v.skuPropertyImagePath)] : []
          })
        } else {
          skuList[1].skuPropertyValues.forEach(v1 => {
            if (!skuList[2]) {
              list.push({
                specifics: [{ key: skuList[0].skuPropertyName, value: v.propertyValueDefinitionName || v.propertyValueName }, {
                  key: skuList[1].skuPropertyName,
                  value: v1.propertyValueDefinitionName || v1.propertyValueName
                }],
                skuMapId: [v.propertyValueId, v1.propertyValueId],
                images: v.skuPropertyImagePath ? [common.formatSrc(v.skuPropertyImagePath)] : []
              })
            } else {
              skuList[2].skuPropertyValues.forEach(v2 => {
                list.push({
                  specifics: [{ key: skuList[0].skuPropertyName, value: v.propertyValueDefinitionName || v.propertyValueName }, {
                    key: skuList[1].skuPropertyName,
                    value: v1.propertyValueDefinitionName || v1.propertyValueName
                  }, { key: skuList[2].skuPropertyName, value: v2.propertyValueDefinitionName || v2.propertyValueName }],
                  skuMapId: [v.propertyValueId, v1.propertyValueId, v2.propertyValueId],
                  images: v.skuPropertyImagePath ? [common.formatSrc(v.skuPropertyImagePath)] : []
                })
              })
            }
          })
        }
      })
    }
    // 通过拼接好的区分项id 与 页面 skuPriceList 中的对应关系组合区分项
    list.forEach(v => {
      const idFormat = v.skuMapId.join(',')
      runParams.skuModule.skuPriceList.forEach(v1 => {
        if (idFormat === v1.skuPropIds) {
          const obj = this.createBaseData(v1, v)
          obj.specifics = v.specifics
          attribute.push(obj)
        }
      })
    })
    if (!attribute.length) {
      attribute.push(this.createBaseData(runParams.skuModule.skuPriceList[0]))
    }
    attribute = attribute.filter(v => v.stock_num)
    return attribute
  },
  createBaseData(skuPriceItem, skuNameItem) {
    const productInfoEl = $('.product-info')
    return {
      shipping: {
        start_arrivals: '', // 发货地 无法取到
        delivery: productInfoEl.find('.product-shipping-deliver-content').text().trim() ? (productInfoEl.find('.product-shipping-deliver-content').text().trim() + ' ' + productInfoEl.find('.product-shipping-info').text()) : productInfoEl.find('.product-shipping-info').text() || '', // 运输方式
        delivery_time: productInfoEl.find('.product-shipping-delivery').text() || '', // 配送时间
        price: productInfoEl.find('.product-shipping-price').text().trim().replace(/[^\d\.]/g, '') || '0.00'
      },
      price: {
        selling_price: (skuPriceItem.skuVal.skuActivityAmount ? skuPriceItem.skuVal.skuActivityAmount.value : skuPriceItem.skuVal.skuActivityAmount) || '0.00',
        original_price: skuPriceItem.skuVal.skuAmount ? skuPriceItem.skuVal.skuAmount.value : '0.00'
      },
      stock_num: skuPriceItem.skuVal.inventory,
      product_weight: '',
      packing: '',
      images: skuNameItem ? skuNameItem.images : [],
      product_no: skuPriceItem.skuIdStr
    }
  },
  // 详情
  async fetachDetail() {
    const details = {
      params: [],
      images: [],
      description: ''
    }
    $('#product-detail .product-detail-tab ul:eq(0) li:eq(0)').click();
    await common.delay(300)
    details.description = $('#product-description .detail-desc-decorate-richtext>div').eq(0).text().trim() ? $('#product-description .detail-desc-decorate-richtext>div').eq(0).text().trim() : $('#product-description').html().replace(/\s+/g,' ').replace(/[\n↵\r]+/g, '').replace(/\t/g, '').replace(/\"/g, '\'').replace(
      /(https:|http:)?(\/\/[A-Za-z0-9\-.\/]*\.(jpg|jpeg|gif|png))/g,
      'https:$2'
    ).replace(/(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)|(?<=<a\s*.*href=')[^']*(?=')/gi, 'javascript:;').replace(/(<br>){2,}|(<br\/>){2,}/, '<br>')
    $('#product-detail .product-detail-tab ul:eq(0) li:eq(2)').click()
    // await common.delay(3000)
    await common.delay(300)
    const paramsList = $('.tab-content>div').eq(3).find('ul li')
    // params
    $(paramsList).each(
      (i, el) => {
        const paramsArr = $(el).text().trim().split(':')
        // const paramsKey = paramsArr[0].trim()
        // if (paramsKey === "Brand Name") {
        //   brand = paramsArr[1].trim()
        // }
        details.params.push({
          key: paramsArr[0].trim(),
          value: paramsArr[1].trim()
        })
      }
    )
    // console.log(details)
    return details
  }
}