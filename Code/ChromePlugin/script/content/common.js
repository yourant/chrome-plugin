document.addEventListener(
  'DOMContentLoaded',
  function() {
    // 属性弹窗
    var spiderPopBg = document.createElement('div')
    spiderPopBg.id = 'spiderPopBg'
    var popItem = document.createElement('div')
    popItem.id = 'spiderPopTab'
    popItem.className = 'spiderPopTab'
    spiderPopBg.appendChild(popItem)

    /* sfc box */
    const sfcBox = document.createElement('div')
    sfcBox.className = 'spider-box'
    // 竞品采集
    const panel = document.createElement('div')
    panel.className = 'spider-append-icon spider-color-forbidden'
    panel.id = 'append_details'
    panel.innerHTML = '竞品<br />采集'
    sfcBox.appendChild(panel)
    document.body.appendChild(sfcBox)
    // loading
    const mask = document.createElement('div')
    mask.id = 'sfc-collect-mask'
    mask.style = 'display: none'
    const box = document.createElement('div')
    box.className = 'box'
    const content = document.createElement('div')
    content.className = 'loading'
    for (let i = 0; i < 8; i++) {
      const div = document.createElement('div')
      div.style = `left:${32 * (1 + Math.sin(45 / 180 * Math.PI * i)) - 8}px; top:${32 * (1 - Math.cos(45 / 180 * Math.PI * i)) - 8}px;animation-delay: ${0.125 * i}s`
      content.appendChild(div)
    }
    box.appendChild(content)
    const text = document.createElement('p')
    text.innerText = '数据采集中...'
    text.className = 'collect-text'
    box.appendChild(text)
    mask.appendChild(box)
    document.body.appendChild(mask)
    document.body.appendChild(spiderPopBg)
    detailFnCommon.init() // 初始化存储from_id或collection_sku_id
  },
  true
)

const detailFnCommon = {
  init() {
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      this.setTabUrl()
    } else {
      setTimeout(() => {
        this.init()
      }, 200)
    }
  },
  setTabUrl() {
    const params = {
      href: window.location.href,
      referrer: document.referrer || window.location.href
    }
    const requestData = common.getRequest()
    if (requestData.isClear) {
      return
    }
    if (requestData.from_id) {
      params.code = 'save_from_id'
      params.from_id = 'from_id=' + requestData.from_id
      common.productId = requestData.from_id
      common.isCollect = false
      chrome.runtime.sendMessage(params)
      this.createFromId()
    } else if (requestData.collection_sku_id) {
      params.code = 'save_from_id'
      params.from_id = 'collection_sku_id=' + requestData.collection_sku_id
      common.productId = requestData.collection_sku_id
      common.isCollect = true
      // rakuten平台列表增加关联id,链接打开时会重定向。此处还是有问题
      for (let i = 0; i < common.extLinkArr.length; i++) {
        if (params.href.indexOf(common.extLinkArr[i]) > -1) {
          const a = $('.searchresults').find('a')
          for (let j = 0; j < a.length; j++) {
            let href = $(a[j]).attr('href')
            if (href.indexOf('?') > -1) {
              href = href + '&' + params.from_id
            } else {
              href = href + '?' + params.from_id
            }
            $(a[j]).attr('href', href)
          }
          // $('a').click(function() {
          //   return common.openExtLink(this, params.from_id)
          // })
        }
      }
      chrome.runtime.sendMessage(params)
      this.createFromId()
    } else {
      params.code = 'get_from_id'
      chrome.runtime.sendMessage(params, response => {
        if (response.from_id && response.from_id.indexOf('=') > 0) {
          const param = response.from_id.split('=')
          common.isCollect = param[0] !== 'from_id'
          common.productId = param[1]
        }
        this.createFromId()
      })
    }
  },
  createFromId() {
    if (!common.productId) {
      common.productId = common.getFromId()
    }
    if (common.productId) {
      const idFixed = $(`<div class="spider-append-id">关联ID：${common.productId}</div>`)
      idFixed.on('mouseover', () => {
        idFixed.text('点击可清除关联 ID')
      })
      idFixed.on('mouseout', () => {
        idFixed.text(`关联ID：${common.productId}`)
      })
      idFixed.on('click', () => {
        common.removeFromId()
      })
      idFixed.appendTo('.spider-box')
    }
  }
}

const common = {
  productId: '',
  isCollect: false,
  // 排除包含这些字符的链接
  extLinkArr: ['search.rakuten.co.jp/search'],
  //
  openExtLink(a, id) {
    console.log(a)
    if (a.href.indexOf('javascript:') >= 0) {
      return false
    }
    let r = a.href
    for (let i = 0; i < this.extLinkArr.length; i++) {
      if (r.indexOf(this.extLinkArr[i]) > -1) {
        //如果在指定的排除链接中，就执行href；
        return true
      }
    }
    if (r.indexOf('?') > -1) {
      r = encodeURIComponent(r) + '&' + id
    } else {
      r = encodeURIComponent(r) + '?' + id
    }
    window.open(r, '_blank')
    return false
  },
  // 关联ID
  getFromId() {
    let from_id = ''
    let collection_sku_id = ''
    const hrefParams = common.getRequest('?' + location.href.split('?')[1])
    const referrerParams = common.getRequest('?' + document.referrer.split('?')[1])
    from_id = referrerParams.from_id
    from_id = from_id || hrefParams.from_id || ''
    collection_sku_id = referrerParams.collection_sku_id
    collection_sku_id = collection_sku_id || hrefParams.collection_sku_id || ''
    common.isCollect = !from_id
    return from_id || collection_sku_id
  },
  currentUrl: [
    'https://shopee.com.my/',
    'https://shopee.sg/',
    'https://shopee.tw/',
    'https://shopee.co.id/',
    'https://shopee.co.th/',
    'https://shopee.vn/',
    'https://shopee.ph/',
    'https://shopee.com.br/',
    'http://shopee.com.my/',
    'http://shopee.sg/',
    'http://shopee.tw/',
    'http://shopee.co.id/',
    'http://shopee.co.th/',
    'http://shopee.vn/',
    'http://shopee.ph/',
    'http://shopee.com.br/',
    'https://www.amazon.ae/',
    'https://www.amazon.com.au/',
    'https://www.amazon.com.br/',
    'https://www.amazon.ca/',
    'https://www.amazon.de/',
    'https://www.amazon.es/',
    'https://www.amazon.fr/',
    'https://www.amazon.it/',
    'https://www.amazon.co.jp/',
    'https://www.amazon.com.mx/',
    'https://www.amazon.nl/',
    'https://www.amazon.sg/',
    'https://www.amazon.co.uk/',
    'https://www.amazon.com/'
  ],
  /**
   * @description: 商家排名过滤
   */
  filterSaleRank: [
    '亚马逊热销商品排名',
    'Posizione nella classifica Bestseller di Amazon',
    'Best Sellers Rank',
    'Ranking dos mais vendidos',
    'Customer Reviews',
    'Plaats in bestsellerlijst',
    'Classement des meilleures ventes d\'Amazon',
    'Amazon Bestseller-Rang'
  ],
  // 获取url中参数对象
  getRequest: (url = location.search) => {
    if (['?undefined', 'undefined', '?'].includes(url) || !url) {
      return {}
    }
    const theRequest = {}
    if (url.indexOf('?') !== -1) {
      const str = url.substr(1)
      const strs = str.split('&')
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split('=')[0]] = strs[i].split('=')[1]
      }
    }
    return theRequest
  },
  // async createFromId() {
  //
  //   let product_id
  //   chrome.runtime.sendMessage(
  //     {
  //       code: 'get_from_id',
  //       href: window.location.href,
  //       referrer: document.referrer || window.location.href
  //     },
  //     response => {
  //       if ((response.from_id && response.from_id.indexOf('=') > 0)) {
  //         // 已登录
  //         product_id = response.from_id.split('=')[1]
  //         const idFixed = $(`<div class="spider-append-id">关联ID：${product_id}</div>`)
  //         // idFixed.attr('title', '点击可清除关联 ID')
  //         // idFixed.on('click', () => {
  //         //   this.removeFromId()
  //         // })
  //         idFixed.appendTo('.spider-box')
  //       }
  //     }
  //   )
  //
  //   // let fromId = this.getRequest().from_id
  //   // // if(this.getRequest().from_id){
  //   // //   fromId=this.getRequest().from_id
  //   // //   sessionStorage.setItem('fromId',this.getRequest().from_id);
  //   // // }else{
  //   // //  fromId=sessionStorage.getItem('fromId');
  //
  //   // // }
  //   // if (fromId != '' && fromId != null && fromId != undefined) {
  //   //   const idFixed = $(`<div class="spider-append-id">关联ID：${fromId}</div>`)
  //   //   idFixed.attr('title', '点击可清除关联 ID')
  //   //   idFixed.on('click', () => {
  //   //     this.removeFromId()
  //   //   })
  //   //   idFixed.appendTo('.spider-box')
  //   // }
  // },
  removeFromId() {
    // 删除全局from_ids对象中保存的关联id信息
    chrome.runtime.sendMessage(
      {
        code: 'del_from_id',
        href: window.location.href,
        referrer: document.referrer || window.location.href
      },
      response => {
        let paramKey = ''
        let url = window.location.href
        if (url.indexOf('from_id') > 0) {
          paramKey = 'from_id'
        } else if (url.indexOf('collection_sku_id') > 0) {
          paramKey = 'collection_sku_id'
        }
        $('.spider-append-id').remove()
        common.isCollect = false
        common.productId = ''
        if (paramKey) {
          url = this.delParam(paramKey)
        }
        // 清除关联id后url后追加参数isClear=true
        if (url.indexOf('?') > -1) {
          url = url + '&isClear=true'
        } else {
          url = url + '?isClear=true'
        }
        window.location.href = url
      }
    )
  },
  // 去除url中某（key）参数
  delParam(key) {
    let url = window.location.href
    if (url.indexOf('?') === -1) {
      return url
    }
    const urlArr = url.split('?')
    let search = ''
    const urlParamArr = []
    const urlParam = urlArr[1].split('&')
    for (let i = 0; i < urlParam.length; i++) {
      if (urlParam[i].split('=')[0] !== key) {
        urlParamArr.push(urlParam[i])
      }
    }
    if (urlParamArr.length > 0) {
      search = '?' + urlParamArr.join('&')
    }
    return urlArr[0] + search
  },
  // 登录
  login() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
          code: 'getUserCode',
          message: 'success',
          data: ''
        },
        response => {
          if (response) {
            // 已登录
            resolve(response)
            // this.user.code = response
            // this.sfcAbled()
          } else {
            // 未登录
            window.open('http://account.suntekcorps.com:8080/')
          }
        }
      )
    })
  },
  // 平台id 是否为istore广告
  // productISistore(product) {
  //   return new Promise((resolve, reject) => {
  //     chrome.runtime.sendMessage({
  //         //插件监听请求
  //         code: 'haveAdvt1',
  //         message: 'success',
  //         data: product
  //       },
  //       function(response) {
  //         console.log(response)
  //         resolve(123)
  //       }
  //     )
  //   })
  // },

  /**
   * @description: 首页、店铺和搜索禁用按钮
   */
  forbiddenIcon() {
    const error = ['502 Bad Gateway', '504 Gateway Time-out']
    const text = $('center>h1').text().trim()
    const url = window.location.href
    const amazonCartKeywords = ['/cart/view.html', '/huc/view.html', 'add-to-cart/html', 'handle-buy-box']
    const isAmazon = url.includes('www.amazon')
    const re = /^(https|http):\/\/www\.amazon\.[a-z\.]*\/s\?k=/g
    if (this.currentUrl.includes(url) || $('.product-not-exist').length || (text && error.includes(text)) || re.test(url)) {
      $('#append_details').addClass('spider-color-forbidden')
      $('#append_details').css('pointer-events', 'none')
      $('#append_details').css('cursor', 'not-allowed')
    }
    // 进入amazon平台购物车相关页面，禁用采集
    if (isAmazon && amazonCartKeywords.some(v => url.includes(v))) {
      $('#append_details').addClass('spider-color-forbidden')
      $('#append_details').css('pointer-events', 'none')
      $('#append_details').css('cursor', 'not-allowed')
    }
  },

  /**
   * @description: 保存前属性选择
   * @param { Object } data 要保存的数据
   */
  selectAttributeFn(data) {
    $('#sfc-collect-mask').attr('style', 'display:none')

    /**
     * 2020-05-22 属性直接提交
     * @description: 根据details.params决定是否展示属性弹框
     * */

    chrome.runtime.sendMessage(data, function(response) {
      // 收到来自后台回复消息
      let product_id = ''
      if (response.data && response.data.product_id) {
        product_id = '，product_id: ' + response.data.product_id
      }
      product_id = product_id || '，请刷新页面重试'
      alert(response.message + product_id)
      $('#sfc-collect-mask').attr('style', 'display:none')
      $('#spiderPopTab').attr('style', 'display: none')
      $('#spiderPopBg').attr('style', 'display: none')
      $('#bg').prop('display', 'none')
      $('#spiderPopBg').attr('style', 'display: none')
    })
  },
  /*
   * 选择ID来源
   */
  selectIdFrom() {
    let html = '<p class="titles">选择要关联的ID来源</p><div><form class="radioForm">' +
      '<input type="radio" name="sex" id="from_id" checked value="from_id"/>' +
      '<label for="from_id">iStore</label>' +
      '<input type="radio" name="sex" id="sku_id" value="collection_sku_id" />' +
      '<label for="sku_id">数据采集</label><br>' +
      '<span>ID：</span>' +
      '<input id="productIdInput" style="padding-left:10px;outline:none;" value=""/>' +
      '</form></div>'
    html = html + '</ul><div class="btnTab"><span class="btn spider-sure" id="spiderSure">确定</span><span class="btn spider-cancel" id="spiderCancel">取消</span></div>'
    $('#spiderPopTab').html(html).attr('style', 'display: block')
    $('#spiderPopBg').attr('style', 'display: block')
    $('#spiderSure').unbind('click').bind('click', function() {
      const id = $('#productIdInput').val().trim() // 需判断全数字
      const regexp = new RegExp(/[0-9]+/)
      if (regexp.test(id)) {
        if (Number(id) > 2147483647) {
          alert('id 最大不能超过 2147483647')
        } else {
          // retrun
          detailFn.isCollect = $('.radioForm input:radio:checked').val() == 'from_id' ? false : true
          $('#spiderPopTab').html(html).attr('style', 'display: none')
          $('#spiderPopBg').attr('style', 'display: none')
          detailFn.clickRun(id)
        }
      } else {
        alert('请输入正确的数字ID')
      }
    })
    $('#spiderCancel').unbind('click').bind('click', function() {
      $('#spiderPopTab').html(html).attr('style', 'display: none')
      $('#spiderPopBg').attr('style', 'display: none')
    })
  },
  /**
   * @description: format script element
   */
  formatScript(text) {
    return text && text.replace(/(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)|(?<=<a\s*.*href=")[^"]*(?=")|(<br\/>){2,}|(<br>){2,}|\s{2,}/gi, '').replace(/[\n↵\r]+/g, '').replace(/\s+/g, ' ')
  },
  /**
   * @description: 延时操作
   */
  delay(num) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true)
      }, num)
    })
  },

  /**
   * @description: 延时等待
   */
  delayTime(num) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true)
      }, num)
    })
  },
  /**
   * @description: 过滤空数据
   */
  deleteEmptyProperty(data) {
    const list = []
    data.forEach(function(item, index) {
      if (Object.values(item)[0] && Object.values(item)[1]) {
        list.push(item)
      }
    })
    return list
  },

  /**
   * @description: 数组对象去重
   */
  reduceObject(data) {
    let obj = {}
    return data.reduce((cur, next) => {
      obj[next.id] ? '' : obj[next.id] = true && cur.push(next)
      return cur
    }, [])
  },
  /**
   * @description: 给image添加https协议
   */
  formatSrc(src) {
    return src && src.replace(/(https:|http:)?(\/\/((?!\.jpg|jpeg|gif|png).)+\.(jpg|jpeg|gif|png))((((?!\/\/).)+\.(jpg|jpeg|gif|png))+)?((((?!webp).)+)?\.webp)?/g, 'https:$2')
  },

  /**
   * @description: 去除图片链接中的缩小倍数
   */
  formatAttr(src) {
    return src && src.slice(0, src.lastIndexOf('_tn'))
  },
  /**
   * @description: 匹配纯数字
   */
  formatNumber(num) {
    return num && num.replace(/[^0-9]/g, '')
  },
  /**
   * @description: 去除文字中的: | ：
   */
  formatText(text) {
    return text && text.replace(/↵+|\s+|:|：\((([a-zA-Z])|\s+)*\)$/g, '')
  },

  /**
   * @description: 去除文本左右空格
   */
  formatSpace(text) {
    return text && text.replace(/(^\s*)|(\s*$)/g, '')
  },
  /**
   * @description: 设置cookie
   *
   */
  setCookie(key, value, t, domain) {
    const oDate = new Date()
    let timeStrap = oDate.getTime() + t * 24 * 60 * 60 * 1000
    document.cookie = key + '=' + value + '; expires=' + new Date(timeStrap) + '; domain=' + domain + '; path=/'
  },

  /**
   * @description: 获取cookie
   */
  getCookie(cookieName) {
    const cookies = document.cookie.split('; ')
    let cookie = ''
    if (cookies.length) {
      cookies.map(v => {
        let keyArr = v.split('=')
        if (keyArr[0] === cookieName) {
          cookie = keyArr[1]
        }
      })
    }
    return cookie
  },

  /**
   * @description:  匹配币种
   */
  formatCurrency(text) {
    // return text && text.replace(/[$€A-Za-z]\s?/g, '')
    return text && text.replace(/[^0-9\.\,\，]/g, '')
  },
  forbiddenLazadaIcon() {
    // 详情页面url固定位置带有products 列表无
    const url = location.href
    const isDetail = url.split('/')[3] === 'products'
    if (!isDetail) {
      $('#append_details').addClass('spider-color-forbidden')
      $('#append_details').css('pointer-events', 'none')
      $('#append_details').css('cursor', 'not-allowed')
      console.log($('#append_details'))
    }
  },
  forbiddenAliexpressIcon() {
    const url = location.href
    // 非详情页面禁用采集
    if (url.indexOf('/item/') < 0) {
      $('#append_details').addClass('spider-color-forbidden')
      $('#append_details').css('pointer-events', 'none')
      $('#append_details').css('cursor', 'not-allowed')
    }
  }
}
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   console.log('进入 common')
//   switch (request.code) {
//     case 'create-tab': {
//       common.data.sfcToDetail = request
//       console.log(222, request)
//     }
//     break
//   }
// })