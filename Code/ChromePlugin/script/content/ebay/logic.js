var ebayLogic = {
  // 属性
  async fetchAttribute() {
    if ($('.vi-msku-cntr').eq(0).find('select')[0]) {
      $('.vi-msku-cntr').eq(0).find('select')[0].value = -1
      $('.vi-msku-cntr').eq(0).find('select')[0].dispatchEvent(new MouseEvent('change'))
    }
    if ($('.vi-msku-cntr').eq(1).find('select')[0]) {
      $('.vi-msku-cntr').eq(1).find('select')[0].value = -1
      $('.vi-msku-cntr').eq(1).find('select')[0].dispatchEvent(new MouseEvent('change'))
    }
    if ($('.vi-msku-cntr').eq(2).find('select')[0]) {
      $('.vi-msku-cntr').eq(2).find('select')[0].value = -1
      $('.vi-msku-cntr').eq(2).find('select')[0].dispatchEvent(new MouseEvent('change'))
    }
    await common.delay(100)
    const arr = []
    const list1 = this.getList(0)
    const list1Key = $('.vi-msku-cntr').eq(0).find('label').text().replace(':', '').trim()
    // const list2 = $('.vi-msku-cntr').eq(1).find('option[id]')
    const list2Key = $('.vi-msku-cntr').eq(1).find('label').text().replace(':', '').trim()
    // const list3 = $('.vi-msku-cntr').eq(2).find('option[id]')
    const list3Key = $('.vi-msku-cntr').eq(2).find('label').text().replace(':', '').trim()
    let i = 0
    while (i < list1.length) {
      if (list1.eq(i).attr('disabled')) {
        i++
        continue
      }
      $('.vi-msku-cntr').eq(0).find('select')[0].value = list1.eq(i).attr('value')
      $('.vi-msku-cntr').eq(0).find('select')[0].dispatchEvent(new MouseEvent('change'))
      await common.delay(100)
      const list1Value = list1.eq(i).text()
      const list2 = this.getList(1)
      if (!list2.length) {
        const obj = { specifics: [{ key: list1Key, value: list1Value }] }
        Object.assign(obj, this.getProductPrice())
        arr.push(obj)
      } else {
        let i1 = 0
        while (i1 < list2.length) {
          if (list2.eq(i1).attr('disabled')) {
            // 如果循环到最后一层，插入数据后把选项置空，否则会影响下拉框值
            if (i1 === list2.length - 1) {
              $('.vi-msku-cntr').eq(0).find('select')[0].value = -1
              $('.vi-msku-cntr').eq(0).find('select')[0].dispatchEvent(new MouseEvent('change'))
              $('.vi-msku-cntr').eq(1).find('select')[0].value = -1
              $('.vi-msku-cntr').eq(1).find('select')[0].dispatchEvent(new MouseEvent('change'))
              await common.delay(100)
            }
            i1++
            continue
          }
          $('.vi-msku-cntr').eq(1).find('select')[0].value = list2.eq(i1).attr('value')
          $('.vi-msku-cntr').eq(1).find('select')[0].dispatchEvent(new MouseEvent('change'))
          await common.delay(100)
          const list3 = this.getList(2)
          const list2Value = list2.eq(i1).text()
          if (!list3.length) {
            const obj = { specifics: [{ key: list1Key, value: list1Value }, { key: list2Key, value: list2Value }] }
            Object.assign(obj, this.getProductPrice())
            arr.push(obj)
            // 如果循环到最后一层，插入数据后把选项置空，否则会影响下拉框值
            if (i1 === list2.length - 1) {
              $('.vi-msku-cntr').eq(0).find('select')[0].value = -1
              $('.vi-msku-cntr').eq(0).find('select')[0].dispatchEvent(new MouseEvent('change'))
              $('.vi-msku-cntr').eq(1).find('select')[0].value = -1
              $('.vi-msku-cntr').eq(1).find('select')[0].dispatchEvent(new MouseEvent('change'))
              await common.delay(100)
            }
          } else {
            let i2 = 0
            while (i2 < list3.length) {
              const list3Value = list3.eq(i2).text()
              if (list3.eq(i2).attr('disabled')) {
                // 如果循环到最后一层，插入数据后把选项置空，否则会影响下拉框值
                if (i2 === list3.length - 1) {
                  $('.vi-msku-cntr').eq(1).find('select')[0].value = -1
                  $('.vi-msku-cntr').eq(1).find('select')[0].dispatchEvent(new MouseEvent('change'))
                  $('.vi-msku-cntr').eq(2).find('select')[0].value = -1
                  $('.vi-msku-cntr').eq(2).find('select')[0].dispatchEvent(new MouseEvent('change'))
                  if (i1 === list2.length - 1) {
                    $('.vi-msku-cntr').eq(0).find('select')[0].value = -1
                    $('.vi-msku-cntr').eq(0).find('select')[0].dispatchEvent(new MouseEvent('change'))
                  }
                  await common.delay(100)
                }
                i2++
                continue
              }
              $('.vi-msku-cntr').eq(2).find('select')[0].value = list3.eq(i2).attr('value')
              $('.vi-msku-cntr').eq(2).find('select')[0].dispatchEvent(new MouseEvent('change'))
              await common.delay(100)
              const obj = { specifics: [{ key: list1Key, value: list1Value }, { key: list2Key, value: list2Value }, { key: list3Key, value: list3Value }] }
              Object.assign(obj, this.getProductPrice())
              arr.push(obj)
              // 如果循环到最后一层，插入数据后把选项置空，否则会影响下拉框值
              if (i2 === list3.length - 1) {
                $('.vi-msku-cntr').eq(1).find('select')[0].value = -1
                $('.vi-msku-cntr').eq(1).find('select')[0].dispatchEvent(new MouseEvent('change'))
                $('.vi-msku-cntr').eq(2).find('select')[0].value = -1
                $('.vi-msku-cntr').eq(2).find('select')[0].dispatchEvent(new MouseEvent('change'))
                if (i1 === list2.length - 1) {
                  $('.vi-msku-cntr').eq(0).find('select')[0].value = -1
                  $('.vi-msku-cntr').eq(0).find('select')[0].dispatchEvent(new MouseEvent('change'))
                }
                await common.delay(100)
              }
              i2++
            }
          }
          i1++
        }
      }
      i++
    }
    if (!arr.length) {
      arr.push(this.getProductPrice())
    }
    return arr
  },
  getList(i) {
    return $('.vi-msku-cntr').eq(i).find('option[id]')
  },
  getMainImage() {
    let image = []
    $('#vi_main_img_fs img').each((i, el) => {
      image.push(common.formatSrc($(el).attr('src')).replace('s-l64', 's-l800'))
    })
    if (image.length === 0 && $('#icImg').length) {
      image.push(common.formatSrc($('#icImg').attr('src')).replace('s-l64', 's-l800'))
    }
    image = image.map(v => v.replace('.png', '.jpg'))
    return image
  },
  getProductPrice(product_no) {
    const obj = {
      shipping: {
        start_arrivals: $('.availableAtOrFrom').text().trim(),
        delivery: $('#fshippingCost').text().trim().replace(/\s/g, ''), // 运输方式,
        delivery_time: ''
      },
      price: {
        selling_price: Number(($('#prcIsum').text().trim() || $('#mm-saleDscPrc').text().trim()).replace(/[^\d\.]/g, '')) || '0.00',
        original_price: Number(($('#vi-vpo-uprice').text().trim() || $('#vi-msku-bb-origprice').text().trim() || $('#orgPrc').text().trim() || $('#mm-saleOrgPrc')
          .text()
          .trim() || $('.vi-originalPrice').text().trim()).replace(/[^\d\.]/g, '')) || '0.00'
        // spike_price: '0.00',
        // member_price: '0.00',
        // promotion_price: '0.00',
        // flash_price: '0.00',
        // happy_price: '0.00'
      },
      stock_num: $('#qtySubTxt').text().trim() || 0, // 库存
      product_weight: '',
      packing: '',
      images: [],
      product_no: $('#sel-msku-variation').text().trim() || $('#iid').attr('value') || product_no || $('#descItemNumber').text().trim()
    }
    return obj
  },
  fetchDetail(fetchDesc) {
    const details = {
      params: [],
      images: fetchDesc.images,
      description: fetchDesc.description.replace(/[\n↵\r]+/g, '').replace(/\s+/g, ' ')
    }
    let brand = ''
    // params
    $('#viTabs_0_is table[role="presentation"] tr .attrLabels').each(
      (i, el) => {
        const paramsKey = $(el).text().trim().slice(0, -1)
        if (paramsKey === 'brand' || paramsKey === 'Brand') {
          brand = $(el).next().text().trim()
        }
        details.params.push({
          key: paramsKey,
          value: $(el).next().text().trim()
        })
      }
    )
    return {
      brand,
      details
    }
  },
  // 车辆型号
  async fetchCompatibility(start) {
    const id = $('.cmptBrdr').attr('id')
    const total = $('#totalPageNo').text().trim()
    let current = Number($('#pageId').text().trim())
    let list = []
    let YearIndex, MakeIndex, ModelIndex, TrimIndex, EngineIndex
    $(`#${ id }ctbl tr`).eq(0).find('th').each((j, ele) => {
      if ($(ele).text().indexOf('Year') > -1) {
        YearIndex = j
      }
      if ($(ele).text().indexOf('Make') > -1) {
        MakeIndex = j
      }
      if ($(ele).text().indexOf('Model') > -1) {
        ModelIndex = j
      }
      if ($(ele).text().indexOf('Trim') > -1) {
        TrimIndex = j
      }
      if ($(ele).text().indexOf('Variant') > -1) {
        TrimIndex = j
      }
      if ($(ele).text().indexOf('Engine') > -1) {
        EngineIndex = j
      }
    })
    if (YearIndex > -1 && MakeIndex > -1 && ModelIndex > -1 && TrimIndex > -1 && EngineIndex > -1) {

    } else {
      alert('车库型信息不完整，缺少字段')
      return []
    }
    if (start === 1) {
      if (current !== 1) {
        $(`#${ id }pgn .pg-m a`).eq(1)[0].click()
        await common.delay(5000)
        current = Number($('#pageId').text().trim())
      }
    }
    $(`#${ id }ctbl tr`).each((i, el) => {
      if (i > 0) {
        if ($(el).find('td').find('a').length) {
          $(el).find('td').find('a')[0].click()
        }
        list.push({
          year: $(el).find('td').eq(YearIndex).text().trim(),
          make: $(el).find('td').eq(MakeIndex).text().trim(),
          model: $(el).find('td').eq(ModelIndex).text().trim(),
          trim: $(el).find('td').eq(TrimIndex).text().trim(),
          engine: $(el).find('td').eq(EngineIndex).text().trim()
        })
      }
    })
    if (current < total) {
      $(`#${ id }pgn .pg-cdr a`)[0].click()
      await common.delay(5000)
      list = list.concat(await this.fetchCompatibility())
    }
    return list
  },
  // 类目
  fetchCategory() {
    const cat = {
      category_id: '',
      category_name: [],
      category_tree: []
    }
    $('#vi-VR-brumb-lnkLst tbody tr:first-child ul li a').each((i, el) => {
      cat.category_tree.push(el.href.slice(el.href.lastIndexOf('/') + 1))
      cat.category_name.push($(el).attr('title') || $(el).text().trim())
    })
    if (cat.category_name.length && cat.category_name[cat.category_name.length - 1].indexOf('See more') > -1) {
      cat.category_id = cat.category_tree[cat.category_tree.length - 2]
    } else {
      cat.category_id = cat.category_tree[cat.category_tree.length - 1]
    }
    cat.category_name = cat.category_name.join('>')
    return cat
  },
  // 车型库参数url
  getVehicleUrls(site, product_no) {
    // 配件参数DOM
    const domTable = $('.fTblUK').length ? '.fTblUK' : $('.fTbl').length ? '.fTbl' : ''
    // 总页数
    const pageTotal = $('.pg-bgm #totalPageNo').length ? Number($('.pg-bgm #totalPageNo').text()) : 0
    const urls = []
    let token = ''
    // 源码截取token
    let scripts = Array.from($('script'))
    scripts.forEach(v => {
      if (v.innerText.indexOf('$win.ebayAuthTokens') > -1) {
        token = v.innerText.match(/Bearer[\w\W]*\"/)[0].split('"')[0]
      }
    })
    if (domTable) {
      let baseUrl = `https://api.ebay.com/parts_compatibility/v1/compatible_products/listing/${product_no}?fieldgroups=full&limit=20`
      urls.push(baseUrl)
      if (pageTotal) {
        for (let i = 1; i < pageTotal; i++) {
          urls.push(`${baseUrl}&offset=${i*20}`)
        }
      }
    }
    return {
      request_url: urls,
      Authorization: token,
      "X-EBAY-C-MARKETPLACE-ID": site
    }
  }
}