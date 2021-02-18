var ebayPureLogic = {
  // 属性
  async fetchAttribute() {
    const arr = []
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
      price: {
        selling_price: '0.00',
        original_price: '0.00'
      },
      stock_num: '', // 库存
      product_weight: '',
      packing: '',
      images: [],
      product_no: $('#iid').attr('value') || $('#descItemNumber').text().trim()
    }
    return obj
  },
  fetchDetail(fetchDesc) {
    const details = {
      params: [],
      images: [],
      description: fetchDesc.description.replace(/[\n↵\r]+/g, '').replace(/\s+/g, ' ')
    }
    // params
    $('#viTabs_0_is table[role="presentation"] tr .attrLabels').each(
      (i, el) => {
        const paramsKey = $(el).text().trim().slice(0, -1)
        details.params.push({
          key: paramsKey,
          value: $(el).next().text().trim()
        })
      }
    )
    return {
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
  // getCarOptions() {
  //   // 各站点对应字段显示
  //   const carOptions = {
  //     make: ['Make','Marke','Marque','Marca'],
  //     model: ['Model','Modell',' Modèle','Modelo','Modello'],
  //     year: ['Year','Baujahr','Année','Año','Anno'],
  //     trim: ['Trim','Variant'],
  //     engine: ['Engine','Motor','Moteur','Motor','Motore'],
  //     submodel: ['Submodel'],
  //     type: ['Type','Typ','Version','Tipo'],
  //     bodyStyle: ['BodyStyle'],
  //     chassis: ['Chassis','Plattform','Plateforme','Plataforma','Piattaforma']
  //   }
  //   // keysArr：表头 tableArr：列表组装数据  resultArr:统一格式化数据
  //   let keysArr = [],tableArr = [],resultArr = []
  //   // ca站点为 .fTbl
  //   const DomTable = $('.fTblUK').length ? '.fTblUK' : $('.fTbl').length ? '.fTbl' : ''
  //   if (DomTable) {
  //     let keys = Array.from($(`${DomTable} th`))
  //     // 页面表头Arr
  //     keysArr = keys.map(v => (v.innerText.trim()))
  //     // 页面表格数据
  //     let options = Array.from($(`${DomTable} tr`))
  //     if (!options.length) {
  //       return []
  //     }
  //     for(let i=1;i<options.length;i++) {
  //       let obj = {}
  //       let tdsArr = Array.from(options[i].children)
  //       tdsArr.forEach((v,k) => {
  //         obj[keysArr[k]] = v.innerText
  //       })
  //       tableArr.push(obj)
  //     }
  //     tableArr.forEach(v => {
  //       let obj = {
  //         make: '',
  //         model: '',
  //         year: '',
  //         trim: '',
  //         engine: '',
  //         submodel: '',
  //         type: '',
  //         bodyStyle: '',
  //         chassis: ''
  //       }
  //       for (let key in carOptions) {
  //         for (let v_key in v) {
  //           if (carOptions[key].includes(v_key)) {
  //             obj[key] = v[v_key].trim()
  //           }
  //         }
  //       }
  //       resultArr.push(obj)
  //     })
  //     return resultArr
  //   } else {
  //     return []
  //   }
  // },
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