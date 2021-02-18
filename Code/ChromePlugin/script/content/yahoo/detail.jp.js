window.onload = function() {
  detailFn.init()
}

let userCode = ''
let startTime = 0
const detailFn = {
  is_manual_id: false,
  isCollect: true,
  first: true,
  fetchDesc: {
    has: false
  },
  init() {
    const proNo = location.pathname.split('/')[location.pathname.split('/').length - 2]
    chrome.runtime.sendMessage({
      code: 'checkedAdvt',
      message: 'success',
      data: {
        platform: 'yahoo',
        method: 'istore.adv.productisistoreadvt',
        advt_id: [proNo]
      }
    }, function(response) {
      if (response.type === 0) {
        alert(response.msg)
      }
      if (response.data && response.data[proNo]) {
        $('#append_details').css('background-color', '#ccc')
        $('#append_details').css('pointer-events', 'none') //阻止用户的点击动作产生任何效
        $('#append_details').css('cursor', 'not-allowed')
      }
    })
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      let panel = $('.spider-append-icon')
      panel.removeClass('spider-color-forbidden')
      panel.attr('title', '点击获取竞品数据')
      const that = this
      panel.unbind('click').on('click', function() {
        startTime = new Date().getTime()
        that.Login()
      })
    } else {
      this.init()
    }
  },
  // 点击SFC按钮获取权限系统cookie做登录验证
  Login() {
    chrome.runtime.sendMessage(
      {
        code: 'getUserCode',
        message: 'success',
        data: ''
      },
      response => {
        if (response) {
          // 已登录
          userCode = response

          this.clickIcon()
        } else {
          // 未登录
          window.open('http://account.suntekcorps.com:8080/')
        }
      }
    )
  },
  async clickIcon() {
    this.clickRun(common.productId)
    detailFn.isCollect = common.isCollect
  },
  async clickRun(product_id) {
    let _this = this
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

              _this.fetchProduct(product_id)

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

        _this.fetchProduct(product_id)
      }
      // $('#sfc-collect-mask').css('display', 'block')
    } else {
      //   alert('请点击采集按钮输入Istore Product ID')
      common.selectIdFrom() // 返回手动输入的ID字段和ID来源
      detailFn.is_manual_id = true
    }
  },

  // async checkProduct() {
  //     const _this = this;
  //     let product_id = prompt("请输入Istore Product ID", "");
  //     _this.fetchProduct(product_id); // 还没接口，先暂时直接调
  // },
  async fetchProduct(product_id) {
    const that = this

    this.delay(1000)
    $('body,html').animate({ scrollTop: 800 }, 50)
    const { attribute } = await this.fetchAttribute()
    const { brand, details } = await this.fetachDetail()
    const detail = {
      platform: 'yahoo',//来源平台
      istore_product_id: detailFn.isCollect ? 0 : product_id,//同步istore后ID，此字段和collect_product_id字段二选一，必须存在一个
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      site_domain: window.location.hostname, // 站点url
      product_type: attribute.length > 1 ? 20 : 10, // 产品类型10单品，20vary
      platform_url: window.location.href,//产品的URL地址
      product_name: await this.getProduct_name(), // 产品标题
      product_no: await this.getProductno(),//第三方台产品编号（id）ok
      brand: brand, // 品牌名字 没有传控字符串''
      main_image: await this.banner(), // 主图
      category: await this.fetchCategory(), //目录
      attributes: attribute,//区分项数组，长度>1个才算是vary
      details: details,//详情对象
      shop: await this.getShop(),//店铺信息对象
      user_id: userCode.userId,//用户id，增加登录后必填
      user_name: userCode.name,//用户姓名，增加登录后必填
      import_user: userCode.username,//用户工号，目前使用
      total_sales: -1,
      keyword: document.referrer.indexOf('?') > -1 ? common.getRequest('?' + document.referrer.split('?')[1]).p : '',
      favorite: -1, // 收藏数
      month_sales: -1, // 月销量
      total_comment: -1, // 累积评论
      good_comment: -1, // 好评数
      comment_percent: -1 // 好评度
    }

    console.log(detail)

    const params = {
      code: '0',
      message: 'success',
      data: detail,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    if (!params.data.shop.shop_name) {
      params.code = '2'
      params.message = '采集失败，无法获取店铺名称'
      alert('采集失败，无法获取店铺名称')
    } else if (!params.data.product_name) {
      params.code = '2'
      params.message = '采集失败，无法获取产品名称'
      alert('采集失败，无法获取产品名称')
    }

    chrome.runtime.sendMessage(params, function(response) {
      $('#sfc-collect-mask').css('display', 'none')
      if (response === 'error') {
        console.log(response)
        alert('保存失败')
        return
      }
      // 收到来自后台回复消息
      if (response.message) {
        alert(response.message + ',product_id:' + response.data.product_id)
        console.log(response)
      }
      console.log(response)
    })
  },
  //产品标题
  getProduct_name() {
    let Product_name = undefined
    if (window.location.hostname.includes('paypaymall')) {
      Product_name = $('.ItemName_main').text().trim()
    } else {
      Product_name = $('.mdItemInfoTitle').children('h2').length > 0 ? $('.mdItemInfoTitle').children('h2').text().trim() : $('.mdItemName').find('.elName').text().trim()
    }
    return Product_name
  },
  //店铺信息
  getShop() {
    let shop = undefined
    //精品店判断
    if (window.location.hostname.includes('paypaymall')) {
      shop = {
        shop_name: $('#str').text().replace(/\s*/g, ''),
        shop_url: $('#str a').attr('href')
      }
    } else {
      shop = {
        shop_name: $('#strh > div > dl > dt').text().trim() !== '' ? $('#strh > div > dl > dt').text().replace(/\s*/g, '') : $('#strh .elInfoMain').eq(0).text().replace(/\s*/g, ''),
        shop_url: $('#strh > div > dl > dt > a').length > 0 ? $('#strh > div > dl > dt > a').attr('href') : $('#strh .elInfoMain').eq(0).find('a').attr('href')
      }
    }

    return shop
  },
  //第三方产品编号
  getProductno() {
    //精品店判断
    let id = undefined
    if (window.location.hostname.includes('paypaymall')) {
      id = $('.ItemQa_post a').attr('href').split('=')[1]
    } else {
      $('#abuserpt p').each(function(i, p) {
        if ($(p).text().includes('商品コード：')) {
          id = $(p).text().trim().split('商品コード：')[1]
          //console.log($(p).text().trim().split('商品コード：'))
        }
      })
      $('#itm_cat').children('ul').children('li').each(function(j, li) {
        if ($(li).children('.elRowTitle').text().includes('商品コード')) {
          id = $(li).children('.elRowData').text().trim()
        }
      })
      if (id === undefined) {
        id = document.location.pathname.split('.html')[0].split('/')[2]
        //document.location.pathname.split('.html')[0].split('/')[document.location.pathname.split('.html')[0].split('/').length -1]
      }

    }

    return id
  },

  //主图
  banner() {

    const image = []
    if (window.location.hostname.includes('paypaymall')) {
      $('.ItemThumbnail_list li img').each(function(i, img) {
        image.push(common.formatSrc($(img).attr('src')))
      })
    } else {
      $('#itmbasic .elThumbnail').find('li').each(function(i, li) {
        if ($(li).find('img').length > 0) {
          image.push(common.formatSrc($(li).find('img').attr('src')))
        }
      })

    }
    return image
  },
  // 类目
  fetchCategory() {
    let name = []//暂存类目名称
    // 类目
    const cat = {
      category_id: '',
      category_tree: [],
      category_name: ''
    }
    // 由于采集广告页面获取目录的div标签的id有多种，设for循环20次，匹配正确ID为止，
    // 暂时发现： #CentItemInfo13， #CentItemInfo6  #CentItemInfo4

    if (window.location.hostname.includes('paypaymall')) {
      $('.TableRow_body .Breadcrumb li').each(function(i, li) {
        name.push($(li).text().trim())
      })
      $('.TableRow_body .Breadcrumb li a').each(function(i, a) {
        cat.category_tree.push($(a).attr('data-ylk').split('gcat_id:')[1])
      })

    } else {

      if ($('.elItemCategory').children('p').text().includes('この商品のカテゴリ：')) {
        $('.elItemCategory').children('ol').find('li').each(function(i, li) {
          //name
          name.push($(li).children('a').children('span').text())
          //id
          let id = $(li).children('a').attr('href').replace('https://shopping.yahoo.co.jp/category/', '').replace(/[^0-9/ ]/ig, '').split('/')
          cat.category_tree.push(id[id.length - 2])
        })

      }
    }
    cat.category_name = name.join('>')
    cat.category_id = cat.category_tree[cat.category_tree.length - 1]
    return cat
  },

  // 属性
  async fetchAttribute() {

    const that = this
    //let product_type//产品类型
    let attribute = [] // attribute 包含多个baseData结构

    function rebaseData() {
      return baseData = {
        shipping: {
          start_arrivals: '',
          delivery: '',
          delivery_time: ''
        },
        price: {
          selling_price: '0.00',
          original_price: '0.00'
          // spike_price: '0.00',
          // member_price: '0.00',
          // promotion_price: '0.00',
          // flash_price: '0.00',
          // happy_price: '0.00'
        },
        stock_num: 0,
        product_weight: '',
        packing: '',
        product_no: that.getProductno(),
        images: [],
        specifics: []
      }
    }

    //判断网址前缀
    if (window.location.hostname.includes('paypaymall')) {
      console.log(window.location.hostname.includes('paypaymall'))
      await paypaymall()
    } else {
      await getStorm()
    }

    //paypaymall精品店，区分项获取
    async function paypaymall() {
      console.log(that)
      //提前拿到商品价格
      let original_price = '0.00'//原价
      let selling_price = '0.00'//卖价
      if ($('.ItemPrice_price').length > 1) {//有原始价格
        original_price = $('.ItemPrice_price').eq(0).text().replace(/[^0-9]/ig, '')//原始价格
        selling_price = $('.ItemPrice_price').eq(1).text().replace(/[^0-9]/ig, '')
      } else {//无原始价格
        original_price = '0.00'//原始价格
        selling_price = $('.ItemPrice_price').text().replace(/[^0-9]/ig, '')
      }
      if ($('.CartDialog_side').length === 1) { //是vary
        console.log('是vary')
        $('.CartDialog_side').children('ul').each(function(i, ul) {
          $(ul).children('li').each(function(j, li) {
            let lititle = $(li).children('div').text().trim()
            $(li).children('ul').each(function(v, ul) {

              $(ul).children('li').each(async function(c, li) {
                // console.log($(li))
                // 规格数组
                let spec = $(li).children('div').eq(0).find('h4').text().trim() === '' ? lititle : $(li).children('div').eq(0).find('h4').text().trim()
                //子产品图片
                let url = $(li).children('div').eq(0).find('amp-img').length > 0 ? $(li).children('div').eq(0).find('amp-img').attr('src') : ''
                if ($(li).find('li').length > 0) {
                  //有下级属性的
                  $(li).find('li').each(function(k, li) { //组装attribute内每一条数据
                    if ($(li).children('label').children('input').attr('disabled') !== 'disabled') {
                      //初始化baseData
                      let newbaseData = rebaseData()
                      //父级图片或者子图片
                      let chiurl = $(li).children('label').children('span').eq(1).find('amp-img').length > 0 ? $(li).children('label').children('span').eq(1).find('amp-img').attr('src') : ''
                      if (url !== '') {
                        newbaseData.images.push(url.split('?')[0])
                      } else if (chiurl !== '') {
                        newbaseData.images.push(chiurl.split('?')[0])
                      }
                      //key为父级的规格，颜色，尺寸等
                      newbaseData.specifics.push({ 'key': spec, 'value': $(li).find('.OptionItem_text').text().trim() })
                      //主的产品编号
                      newbaseData.product_no = $('.ItemQa_post a').attr('href').split('=')[1]
                      //价格
                      newbaseData.price.original_price = original_price
                      newbaseData.price.selling_price = selling_price
                      //push当前的对象数据
                      attribute.push(newbaseData)
                    }
                  })
                } else {
                  //没有下级属性的
                  if ($(li).children('label').children('input').attr('disabled') !== 'disabled') {
                    //初始化baseData
                    let newbaseData = rebaseData()
                    //父级图片或者子图片
                    let chiurl = $(li).children('label').children('span').eq(1).find('amp-img').length > 0 ? $(li).children('label').children('span').eq(1).find('amp-img').attr('src') : ''
                    if (url !== '') {
                      newbaseData.images.push(url.split('?')[0])
                    } else if (chiurl !== '') {
                      newbaseData.images.push(chiurl.split('?')[0])
                    }
                    //key为父级的规格，颜色，尺寸等
                    newbaseData.specifics.push({ 'key': spec, 'value': $(li).find('.OptionItem_text').text().trim() })
                    //主的产品编号
                    newbaseData.product_no = $('.ItemQa_post a').attr('href').split('=')[1]
                    //价格
                    newbaseData.price.original_price = original_price
                    newbaseData.price.selling_price = selling_price
                    //push当前的对象数据
                    attribute.push(newbaseData)
                  }
                }

              })
            })

          })
        })

      } else {
        //这是单品
        let newbaseData = rebaseData()
        newbaseData.product_no = $('.ItemQa_post a').attr('href').split('=')[1]
        newbaseData.price.original_price = original_price
        newbaseData.price.selling_price = selling_price
        newbaseData.stock_num = 0
        newbaseData.images = []
        attribute.push(newbaseData)

      }

    }

    //普通店铺，区分项获取
    async function getStorm() {
      //提前拿到商品价格
      let original_price = '0.00'//原价
      let selling_price = '0.00'//卖价
      if ($('.mdItemPriceD').find('li').length > 1) {
        $('.mdItemPriceD').find('li').each(function(i, li) {
          if ($(li).text().replace(/(^\s+)|(\s+$)|\s+/g, '').includes('通常販売価格')) {
            original_price = $(li).children('.elWrap').children('.elPrice').find('em').text().replace(/[^0-9]/ig, '')
          }
          if ($(li).text().replace(/(^\s+)|(\s+$)|\s+/g, '').includes('セール価格')) {
            selling_price = $(li).children('.elWrap').children('.elPrice').find('em').text().replace(/[^0-9]/ig, '')
          }
        })
      } else {
        let prices = $('#ItemInfo > div.gdColumns > div.gdColumnRight > div.mdItemPriceC > div > p > span > span').text().trim().replace(',', '')
        original_price = '0.00'//原价
        selling_price = prices//卖价
      }
      //循环商品详情

      //下拉选择器，区分相
      $('.uiOrderOptionA').children('form').find('.elItem').each(function(i, div) {
        //console.log('下拉选择器没进去')
        let title = $(div).children('p').eq(0).children('span').eq(1).find('option').length > 1
        //如果是有价值数据
        if (title) {
          $(div).children('p').eq(0).children('span').eq(1).children('select').find('option').each(function(j, optio) {
            //初始化baseData
            let newbaseData = rebaseData()
            newbaseData.price.original_price = original_price
            newbaseData.price.selling_price = selling_price
            newbaseData.specifics.push({ 'key': $(div).children('p').eq(0).children('span').eq(0).text().trim(), 'value': $(optio).attr('value') })
            attribute.push(newbaseData)
          })
        }
        //循环中无价值数据就不处理

      })
      //下拉选择器，区分相2 https://store.shopping.yahoo.co.jp/tradhousefukiya/morning2.html
      $('#benecart form').find('li').each(function(i, li) {
        //console.log('下拉选择器没进去')
        let title = $(li).children('p').eq(1).find('option').length > 1
        //如果是有价值数据
        if (title) {
          $(li).children('p').eq(1).children('select').find('option').each(function(j, optio) {
            //初始化baseData
            let newbaseData = rebaseData()
            newbaseData.price.original_price = original_price
            newbaseData.price.selling_price = selling_price
            newbaseData.specifics.push({ 'key': $(li).children('p').eq(0).text().trim(), 'value': $(optio).attr('value') })
            attribute.push(newbaseData)
          })
        }
        //循环中无价值数据就不处理

      })
      //表格区分项目
      $('.uiOrderOptionA').find('.elItem').children('table').children('thead').find('th').each(function(i, th) {
        //console.log('表格区分项目没进去')
        if (i > 0) {
          let title = $(th).find('span').eq(1).text()
          let index = i - 1
          $('.uiOrderOptionA').find('.elItem').children('table').children('tbody').children('tr').each(function(t, tr) {
            //console.log( $(tr).children('td').eq(index).text().trim())
            //这里比较绕，不采集无库存的
            let img = $(tr).children('th').find('img').length > 0 ? $(tr).children('th').find('img').attr('src').split('?')[0] : ''
            if (!$(tr).children('td').eq(index).find('label').length > 0) {
              //初始化baseData
              let newbaseData = rebaseData()
              if (img !== '') {
                newbaseData.images.push(img)
              }
              newbaseData.specifics.push({ 'key': title, 'value': $(tr).attr('data-subcode-axis-one') })
              newbaseData.price.original_price = original_price
              newbaseData.price.selling_price = selling_price

              attribute.push(newbaseData)
            }

          })
        }
      })
      //表格区分项目2 https://store.shopping.yahoo.co.jp/tradhousefukiya/morning2.html
      $('#stock').find('.elMain').find('table').children('thead').find('th').each(function(i, th) {
        //console.log('表格区分项目没进去')
        if (i > 0) {
          let title = $(th).find('span').text()
          let index = i - 1
          $('#stock').find('.elMain').find('table').children('tbody').children('tr').each(function(t, tr) {
            //这里比较绕，不采集无库存的
            let img = $(tr).children('th').find('img').length > 0 ? $(tr).children('th').find('img').attr('src').split('?')[0] : ''
            if ($(tr).children('td').eq(index).find('label').length > 0) {

              //初始化baseData
              let newbaseData = rebaseData()
              if (img !== '') {
                newbaseData.images.push(img)
              }
              console.log(title)

              newbaseData.specifics.push({ 'key': title, 'value': $(tr).attr('data-subcode-axis-one') })
              newbaseData.price.original_price = original_price
              newbaseData.price.selling_price = selling_price

              attribute.push(newbaseData)
            }

          })
        }
      })
      //无表头区分项目
      if ($('.uiOrderOptionA').find('.elItem').children('table').children('caption').length > 0) {
        let title = $('.uiOrderOptionA').find('.elItem').children('table').children('caption').text().trim()
        $('.uiOrderOptionA').find('.elItem').children('table').children('tbody').children('tr').each(function(i, tr) {
          if (!$(tr).children('td').eq(0).text().includes('入荷通知')) {
            let newbaseData = rebaseData()
            let img = $(tr).children('th').find('img').length > 0 ? $(tr).children('th').find('img').attr('src').split('?')[0] : ''
            if (img !== '') {
              newbaseData.images.push(img)
            }
            newbaseData.price.original_price = original_price
            newbaseData.price.selling_price = selling_price
            newbaseData.specifics.push({ 'key': title, 'value': $(tr).attr('data-subcode-axis-one') })
            attribute.push(newbaseData)
          }
        })
      }

      if (attribute < 1) {
        //订单详情啥有用都没有的
        let newbaseData = rebaseData()
        newbaseData.price.original_price = original_price//原价
        newbaseData.price.selling_price = selling_price//卖价
        attribute.push(newbaseData)
      }

    }

    return {
      attribute
    }
  },
  // 详情
  async fetachDetail() {
    const that = this
    let brand = undefined
    const details = {
      params: [],
      images: [],
      description: []
    }
    //精品店
    if (window.location.hostname.includes('paypaymall')) {
      $('#itm_inf iframe').contents().find('#wrapper img').each(function(i, img) {
        details.images.push(common.formatSrc($(img).attr('src')))
      })
      brand = $('.ItemBrand') ? $('.ItemBrand').text().trim() : ($('#itm_inf .ItemTable li').eq(0).text().includes('ブランド') ? $('#itm_inf .ItemTable li').eq(0).find('div').eq(1).text().trim() : '')
      $('#itm_inf').remove('.ViolationReport')
      details.description = $('#itm_inf').html().replace(/\n/g, '<br>').replace(/\t/g, '').replace(/\"/g, '\'') + $('#itm_inf iframe')
        .contents()
        .find('#wrapper')
        .html()
        .replace(/\n/g, '<br>')
        .replace(/\t/g, '')
        .replace(/\"/g, '\'')
    } else {
      await getTheStore()
    }

    async function getTheStore() {
      function getdom(dom) {
        return $(dom).html().trim().replace('<h2>商品説明</h2>', '').replace(/\n/g, '<br>').replace(/\t/g, '').replace(/\"/g, '\'')
      }

      function getimg(newimg) {
        console.log($(newimg).find('img'))
        $(newimg).find('img').each(function(i, img) {
          details.images.push($(img).attr('src'))
        })
      }

      if ($('#CenterTop').length > 0) {
        let CentItemCaption1 = getdom('#CentItemCaption1')
        let CentItemAdditional1 = getdom('#CentItemAdditional1')
        let CentItemAdditional2 = getdom('#CentItemAdditional2')
        let CentItemAdditional3 = getdom('#CentItemAdditional3')
        details.description = CentItemCaption1 + CentItemAdditional1 + CentItemAdditional2 + CentItemAdditional3
        await getimg('#CentItemCaption1')
        await getimg('#CentItemAdditional1')
        await getimg('#CentItemAdditional2')
        await getimg('#CentItemAdditional3')
        brand = ''
      }
      // else {
      //   let desc = $('#CentItemCaption1').length ? $('#CentItemCaption1').html().trim().replace('<h2>商品説明</h2>', '').replace(/\n/g, '<br>').replace(/\t/g, '').replace(/\"/g, '\'') : ''
      //   details.description = desc
      //   $('#CentItemCaption1').find('img').each(function(i, img) {
      //     details.images.push($(img).attr('src'))
      //   })
      //   brand = ''
      // }
    }

    return {
      brand,
      details
    }
  },
  /**
   * @description: 延时操作
   */
  delay(num) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, num)
    })
  },
  async getAllSpecies() {

  }
}
