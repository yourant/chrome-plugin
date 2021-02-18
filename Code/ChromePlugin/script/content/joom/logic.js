var joomLogic = {
  // 类目
  fetchCategory() {
    // 类目
    const cat = {
      category_id: 0,
      category_name: [],
      category_tree: []
    }
    $(".item___17cxF").each((i, el) => {
      cat.category_name.push(
        $(el).find('.link___2DAus span').text().trim()
      )
      const categoryList = $(el).find('a').attr('href').split('/')
      if (categoryList.length > 3) {
        cat.category_tree.push(
          categoryList[categoryList.length - 1].replace(/[a-z]\./, '')
        )
      }
    })
    cat.category_id = cat.category_tree[cat.category_tree.length - 1] || 0
    cat.category_name = cat.category_name.join(">")
    return cat
  },
  async fetchAttributes() {
    let arr = []
    // 第0个为购买数量，从1开始
    const list1Key = $('.item___3x9Ra').eq(1).find('h2').text().replace($('.item___3x9Ra').eq(1).find('h2 span').text(), '').replace(':', '').trim()
    const list1 = $('.item___3x9Ra').eq(1).find('>div>div')
    const list2Key = $('.item___3x9Ra').eq(2).find('h2').text().replace($('.item___3x9Ra').eq(2).find('h2 span').text(), '').replace(':', '').trim()
    const list2 = $('.item___3x9Ra').eq(2).find('>div>div')
    const list3Key = $('.item___3x9Ra').eq(3).find('h2').text().replace($('.item___3x9Ra').eq(3).find('h2 span').text(), '').replace(':', '').trim()
    const list3 = $('.item___3x9Ra').eq(3).find('>div>div')
    let index = 0
    while (index < list1.length) {
      this.readySpider()
      list1[index].click()
      await common.delay(100)
      if (!list2.length) {
        const obj = {
          specifics: [{ key: list1Key, value: $('.item___3x9Ra').eq(1).find('h2 span').text() }]
        }
        let images = []
        if ($(list1).find('.selected___GvdwT').find('img').length) {
          let srcArr = $(list1).find('.selected___GvdwT').find('img').attr("srcSet").split(',').map(v => v.trim().split(' ')[0])
          let src = srcArr[srcArr.length - 1]
          images = [common.formatSrc(src)]
        }
        Object.assign(obj, this.getProductPrice(images))
        arr.push(obj)
      }
      let index1 = 0
      while (index1 < list2.length) {
        if ($(list2[index1]).find('span').hasClass('disabledOverlay___1_KGq')) {
          index1++
          continue
        }
        if (!$(list2[index1]).find('div').hasClass('selected___1QFWZ')) {
          $(list2[index1]).find('>div').click()
        }
        await common.delay(100)
        if (!list3.length) {
          const obj = {
            specifics: [
              { key: list1Key, value: $('.item___3x9Ra').eq(1).find('h2 span').eq(0).text() },
              { key: list2Key, value: $('.item___3x9Ra').eq(2).find('h2 span').eq(0).text() },
            ]
          }
          let images = []
          if ($(list1).find('.selected___GvdwT').find('img').length) {
            let srcArr = $(list1).find('.selected___GvdwT').find('img').attr("srcSet").split(',').map(v => v.trim().split(' ')[0])
            let src = srcArr[srcArr.length - 1]
            images = [common.formatSrc(src)]
          }
          Object.assign(obj, this.getProductPrice(images))
          arr.push(obj)
        }
        let index2 = 0
        while (index2 < list3.length) {
          if ($(list2[index1]).find('span').hasClass('disabledOverlay___1_KGq')) {
            index2++
            continue
          }
          list2[index1].click()
          await common.delay(100)
          const obj = {
            specifics: [
              { key: list1Key, value: $('.item___3x9Ra').eq(1).find('h2 span').text() },
              { key: list2Key, value: $('.item___3x9Ra').eq(2).find('h2 span').text() },
              { key: list3Key, value: $('.item___3x9Ra').eq(3).find('h2 span').text() },
            ]
          }
          let images = []
          if ($(list1).find('.selected___GvdwT').find('img').length) {
            let srcArr = $(list1).find('.selected___GvdwT').find('img').attr("srcSet").split(',').map(v => v.trim().split(' ')[0])
            let src = srcArr[srcArr.length - 1]
            images = [common.formatSrc(src)]
          }
          Object.assign(obj, this.getProductPrice(images))
          arr.push(obj)
          index2++
        }
        index1++
      }
      index++
    }
    arr = [...new Set(arr.map(v => JSON.stringify(v)))]
    arr = arr.map(v => JSON.parse(v))
    this.readySpider()
    return arr
  },
  getProductPrice(images) {
    const obj = {
      shipping: {
        start_arrivals: '',
        delivery: $('.shipping___2gj4b').text().split(',')[0] || '', // 运输方式,
        delivery_time: $('.shipping___2gj4b').text().split(',')[1] || ''
      },
      price: {
        selling_price: $('.price___m18Vb').text().replace(/[^\d\.]/g, ''),
        original_price: $('.msrPrice___3i7t6 span').text().replace(/[^\d\.]/g, '')
        // spike_price: '0.00',
        // member_price: '0.00',
        // promotion_price: '0.00',
        // flash_price: '0.00',
        // happy_price: '0.00'
      },
      stock_num: 0, // 库存
      product_weight: '', // 找不到不取
      packing: '', // 找不到不取
      images: images || [],
      product_no: location.pathname.split('/')[location.pathname.split('/').length-1] // 产品id 根据url 取
    }
    return obj
  },
  readySpider() {
    $('.item___3x9Ra').each((i, v) => {
      if (i > 0) {
        this.resetStatus($(v).find('> div > div > div'), ['selected___GvdwT', 'selected___1QFWZ'])
      }
    })
  },
  // 重置点击状态、以方便取数据
  resetStatus(list, className) {
    list.each((i, v) => {
      className.forEach(v1 => {
        if ($(v).hasClass(v1)) {
          $(v).click()
        }
      })
    })
  },
  async fetchMainImage() {
    let image = []
    const image_count = $('.counter___YROzc').text().trim().split("of") || []
    // 获取数量
    if (image_count[1] && image_count[1].length > 0) {
      let i_count = image_count[1].trim()
      let i = 0
      while (i < Number(i_count)) {
        $('.next___f3aJB').click()
        await common.delay(200)
        // 因不确定哪个图片在当前展示，每次循环取所有图片，最后去重
        $('.child___eQkzZ img').each((i, v) => {
          srcArr = $(v).attr("srcSet").split(',').map(v => v.trim().split(' ')[0])
          src = srcArr[srcArr.length - 1]
          image.push(common.formatSrc(src))
        })
        i++
      }
    }
    image = [...new Set(image)]
    return image
  },
  async fetchDetail() {
    const detail = {
      description: $('.text___3JGYJ').html().replace(/[\n↵\r]+/g, '').replace(/\s+/g,' '),
      params: [],
      images: []
    }
    $('.button___2JgYZ').click()
    await common.delay(100)
    $('.item___1mNWu').each((i, v) => {
      detail.params.push({
        key: $(v).find('.name___6T0i4').text(),
        value: $(v).find('.value___2guaH').text()
      })
    })
    return detail
  },
  fetchShop() {
    return {
      shop_name: $('.name___1AuTD').text(),
      shop_url: location.origin + $('.inner___22Ast').attr('href'), // 店铺url
      shop_start: $('.inner___22Ast .full___2k4uO').length + $('.inner___22Ast .half___2qYEj').length / 2, // 店铺星级
    }
  }
}