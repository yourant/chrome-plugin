window.addEventListener('DOMContentLoaded', function() {
  detailFn.init()
  common.forbiddenAliexpressIcon()
})

// let isCollect = true
let startTime = 0
const detailFn = {
  is_manual_id: false,
  first: true,
  fetchDesc: {
    has: false
  },
  isCollect: true,
  userInfo: {},
  init() {
    // let descItemNumber = $("#product-coupon-inner").attr("ae_object_value"); //获取aliExpress item number文本内容
    const winUrl = window.location.pathname
    let descItemNumber = winUrl.includes('item') ? winUrl.split('/item/')[1].split('.')[0] : '' //获取 item number文本内容
    chrome.runtime.sendMessage(
      {
        //插件监听请求
        code: 'haveAdvt',
        message: 'success',
        data: {
          item_id: descItemNumber,
          platform: 'aliexpress'
        }
      },
      function(response) {
        if (response.data.in.indexOf(descItemNumber) != -1) {
          //383485052707: true存在这个就不用采集
          $('#append_details').css('background-color', '#ccc')
          $('#append_details').css('pointer-events', 'none') //阻止用户的点击动作产生任何效
          return
        }
      }
    )
    if (document.querySelector('.spider-append-icon')) {
      document.body.scrollTop = 0
      let panel = $('.spider-append-icon')
      panel.removeClass('spider-color-forbidden')
      panel.attr('title', '点击获取竞品数据')
      const that = this
      panel.unbind('click').on('click', function() {
        startTime = new Date().getTime()
        that.checkVersion()
      })
    } else {
      this.init()
    }
  },
  checkVersion() {
    const that = this
    chrome.runtime.sendMessage(
      {
        code: 'checkVersion',
        message: 'success',
        data: ''
      },
      response => {
        if (response === 'later') {
          alert('版本已过期，请下载最新版本')
          window.open(`http://xian.suntekcorps.com:8825/help/spider`)
        } else {
          that.login()
        }
      }
    )
  },
  // 点击SFC按钮获取权限系统cookie做登录验证
  login() {
    chrome.runtime.sendMessage(
      {
        code: 'getUserCode',
        message: 'success',
        data: ''
      },
      response => {
        if (response) {
          this.userInfo = response
          this.clickIcon()
        } else {
          alert('登录校验失败，请使用权限系统账号登录插件（如已登录，请点击退出按钮重新登录）')
          return
        }
      }
    )
  },
  async clickIcon() {
    const productNo = window.location.href.match(/\d+\.html/)[0].split('.')[0]
    let _this = this
    const collectionConfig = {
      country: 'Russian Federation',
      language: 'English',
      currency: 'USD'
    }
    const site = document.querySelector('.ng-item-wrap.ng-item.ng-switcher div a span i').className.includes('css_ru')
    let lang = document.querySelector('#switcher-info>span.language_txt').innerText === collectionConfig.language
    let currency = document.querySelector('#switcher-info>span.currency').innerText === collectionConfig.currency
    if (!site || !lang || !currency) {
      try {
        // url是否有 &collection_sku_id=xxxx
        const collection_sku_id = common.getRequest().collection_sku_id
        alert('只支持采集RU站点英文环境下币种为USD的产品，程序将自动切换，请等待页面加载完成重新点击采集按钮！')
        // await common.delay(500)
        $('#sfc-collect-mask').attr('style', 'display:block')
        $('.collect-text').text('站点切换中...')
        document.querySelector('#switcher-info').click()
        await common.delay(3000)
        let countrySelector = document.querySelector('.address-select')
        while (!countrySelector) {
          await common.delay(1000)
          countrySelector = document.querySelector('.address-select')
        }
        countrySelector.style.display = 'block'
        await common.delay(500)
        const arr = Array.from(document.querySelectorAll('.address-select-content li.address-select-item'))
        arr.forEach(v => {
          if (v.innerText === collectionConfig.country) {
            v.className += 'address-select-hover'
            v.click()
          }
        })
        countrySelector.style.display = 'none'
        let provinceSelectorShow = document.querySelector('.address-select-trigger[data-role="province"]').style.display === 'none'
        // 仅Ru站点用到，Ru站点需等待城市下拉选项出现设置才生效（122-126）
        while (provinceSelectorShow) {
          await common.delay(1000)
          provinceSelectorShow = document.querySelector('.address-select-trigger[data-role="province"]').style.display === 'none'
        }
        await common.delay(500)
        const languageArr = Array.from(document.querySelectorAll('.switcher-language .language-selector ul li a'))
        languageArr.forEach(v => {
          if (v.innerText === collectionConfig.language) {
            console.log(v, v.innerText)
            v.click()
          }
        })
        await common.delay(1000)
        const currencyArr = document.querySelectorAll('.switcher-currency .switcher-currency-c ul li a')
        currencyArr.forEach(v => {
          if (v.innerHTML.includes(collectionConfig.currency)) {
            v.click()
          }
        })
        await common.delay(1000)
        $('.switcher-btn button').click()
        await common.delay(1000)
        if (collection_sku_id && location.href.indexOf('collection_sku_id') === -1) {
          location.href = location.href.indexOf('?') !== -1 ? location.href + '&collection_sku_id=' + collection_sku_id : location.href + '?collection_sku_id=' + collection_sku_id
        }
        $('#sfc-collect-mask').attr('style', 'display:none')
        $('.collect-text').text('数据采集中...')
      } catch (e) {
        console.log('error', e)
        $('#sfc-collect-mask').attr('style', 'display:none')
        $('.collect-text').text('数据采集中...')
      }
      return
    } else {
      this.clickRun(common.productId)
      detailFn.isCollect = common.isCollect
      // chrome.runtime.sendMessage(
      //   {
      //     code: 'get_from_id',
      //     href: window.location.href,
      //     referrer: document.referrer || window.location.href
      //   },
      //   response => {
      //     if (response.from_id && response.from_id.indexOf('=') > 0) {
      //       // 已登录
      //       product_id = response.from_id.split('=')[1]
      //       detailFn.isCollect = response.from_id.split('=')[0] == 'from_id' ? false : true
      //       this.clickRun(product_id)
      //     } else {
      //       // product_id = prompt('请输入Istore Product ID', '')
      //       common.selectIdFrom() // 返回ID字段和ID来源
      //     }
      //     // this.clickRun(product_id)
      //   }
      // )
    }
  },
  async clickRun(product_id) {
    let _this = this
    if (product_id) {
      if (!detailFn.isCollect) {
        //发送请求产品id是否存在
        chrome.runtime.sendMessage({
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
        // $('#sfc-collect-mask').css('display', 'block')
      } else {
        $('#sfc-collect-mask').attr('style', 'display:block')
        _this.fetchProduct(product_id)
      }
    } else {
      // alert('请点击采集按钮输入Istore Product ID')
      // 选择输入弹框
      common.selectIdFrom()
      detailFn.is_manual_id = true
    }
  },

  async fetchProduct(product_id) {
    location.href = 'javascript:document.body.setAttribute(\'data-runParams\', JSON.stringify(runParams));'
    const getData = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(JSON.parse(document.body.getAttribute('data-runParams')))
        })
      })
    }
    const runParams = await getData()
    // common.delay(1000)
    $('body,html').animate({ scrollTop: 800 }, 50)
    const details = await aliexpressLogic.fetachDetail()
    const detail = {
      platform: 'aliexpress',
      site: 'us',
      istore_product_id: detailFn.isCollect ? 0 : product_id,
      collection_sku_id: detailFn.isCollect ? product_id : 0,
      site_domain: window.location.hostname, // 站点url
      product_type: 10,
      platform_url: window.location.href,
      product_name: $('.product-title').text().trim(), // 产品标题
      product_no: runParams['data']['actionModule']['productId'].toString() || '',
      brand: '', // 品牌
      main_image: [], // 主图
      month_sales: -1, // 月销量
      total_sales: -1,
      favorite: -1,
      total_comment: -1, // 累计评论
      good_comment: -1, // 好评数
      comment_percent: -1, // 好评度
      category: aliexpressLogic.fetchCategory(runParams.data),
      attributes: [
        {
          product_no: runParams['data']['actionModule']['productId'].toString() || '',
          specifics: [],
          price: {
            selling_price: '0.00',
            original_price: '0.00'
          },
          stock_num: '',
          images: []
        }],
      details,
      shop: {
        shop_name: '',
        shop_url: ''
      },
      user_id: this.userInfo.userId,
      user_name: this.userInfo.name,
      import_user: this.userInfo.username,
      source: 'chrome_plugin', // 数据来源，插件爬虫数据不传字段，回写加入，默认：“chrome_plugin”；爬虫：“spider”；
      keyword: document.referrer.indexOf('SearchText') !== -1 ? decodeURIComponent(common.getRequest('?' + document.referrer.split('?')[1]).SearchText || '') : ''
    }
    console.log(detail)
    const params = {
      code: '0',
      data: detail,
      startTime,
      is_manual_id: detailFn.is_manual_id
    }
    common.selectAttributeFn(params)
  }
}
