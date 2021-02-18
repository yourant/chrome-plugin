window.onload = function () {
  setSearch()
}
let url = location.href
const interval = setInterval(() => {
  if (url !== location.href) {
    url = location.href
    setSearch()
  }
}, 1000)

function setSearch() {
  const href = location.href
  if (href === 'http://ebay.szecommerce.com/ebay/advertising') {
    ebaySearchId()
  }
  if (['http://istore.szecommerce.com/amazon/product', 'http://istore.szecommerce.com/amazon/product/index',"http://dev.istore2.com/amazon/product/index"].includes(href)) {
    amazonSearchId()
  }
  if (['http://dev.istore2.com/aliexpress/product/index',"http://istore.szecommerce.com/aliexpress/product*",'http://istore.szecommerce.com/aliexpress/product/index'].includes(href)) {
    aliexpressId()
  }
  if (['http://dev.istore2.com/lazada/product/index',"http://istore.szecommerce.com/lazada/product*",'http://istore.szecommerce.com/lazada/product/index'].includes(href)) {
    lazadaId()
  }
  if (['http://ad.szecommerce.com/kr11street/advertising'].includes(href)) {
    kr11streetId()
  }
  if (['http://ad.szecommerce.com/coupang/advertising'].includes(href)) {
    coupangId()
  }
  if (['http://ad.szecommerce.com/shopee/advertising'].includes(href)) {
    shopeeId()
  }
  if (['http://ad.szecommerce.com/rakuten/advertising'].includes(href)) {
    rakutenId()
  }
  if (['http://istore.szecommerce.com/yahoo/product/', 'http://istore.szecommerce.com/yahoo/product/index'].includes(href)) {
    yahooSearchId()
  }
  if (['http://istore.szecommerce.com/joom/productmanage', 'http://istore.szecommerce.com/joom/productmanage/index'].includes(href)) {
        joomSearchId()
  }
  if (['http://istore.szecommerce.com/wish/product/index', 'http://istore.szecommerce.com/wish/product'].includes(href)) {
        wishSearchId()
  }
}

function ebaySearchId() {
  const event = (a) => {
    const childEl = $(a.target).parents('.el-table__row')
    const parentEl = childEl.parents('tr').prev('.el-table__row.expanded')
    if (childEl[0] && parentEl[0]) {
      const params = {
        code: 'ebay_search_id',
        id: childEl.find('td:nth-child(2)').eq(0).text().trim(),
        title: parentEl.find('td:nth-child(5)').eq(0).text().trim(),
        site: parentEl.find('.data-wrap').attr('data-site_code')
      }
      chrome.runtime.sendMessage(params)
    }
  }
  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function amazonSearchId() {
  const event = (a) => {
    const parentEl = $(a.target).parents('.item')
    if (parentEl[0]) {
      const params = {
        code: 'amazon_search_id',
        id: parentEl.find('>div:nth-child(3)').text().trim(),
        title: parentEl.find('.iDiv3').text().trim(),
        site: parentEl.find('.iDiv3').attr('data-site_code')
      }
      chrome.runtime.sendMessage(params)
    }
  }
  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function aliexpressId() {
  const event = (a) => {
    const parentEl = $(a.target).parents('.divGray')
    if (parentEl[0]) {
      const params = {
        code: 'aliexpress_search_id',
        id: parentEl.find('>div:nth-child(3)').find("a").eq(0).text().trim(),
        title: parentEl.find('.iDiv3').text().trim()
      }
      chrome.runtime.sendMessage(params)
    }
  }
  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function lazadaId() {
  const event = (a) => {
    const parentEl = $(a.target).parents('.divGray')
    if (parentEl[0]) {
      const params = {
        code: 'lazada_search_id',
        id: parentEl.find('>div:nth-child(3)').find("a").eq(0).text().trim(),
        title: parentEl.find('.iDiv3').text().trim()
      }
      console.log(params);
      chrome.runtime.sendMessage(params)
    }
  }
  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function kr11streetId() {
  const event = (a) => {
    const childEl = $(a.target).parents('.el-table__row')
    const parentEl = childEl.parents('tr').prev('.el-table__row.expanded')
    if (childEl[0] && parentEl[0]) {
      const params = {
        code: 'kr11street_search_id',
        id: childEl.find('td:nth-child(1) .cell').text().trim(),
        title: childEl.find('td:nth-child(2) .cell').text().trim(),
        site: ''
      }
      chrome.runtime.sendMessage(params)
    }
  }
  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function coupangId() {
  const event = (a) => {
    const childEl = $(a.target).parents('.el-table__row')
    const parentEl = childEl.parents('tr').prev('.el-table__row.expanded')
    if (childEl[0] && parentEl[0]) {
      const params = {
        code: 'coupang_search_id',
        id: childEl.find('td:nth-child(1) .cell').text().trim(),
        title: parentEl.find('td:not(.el-table-column--selection)').eq(6).find('.cell div:first-child').text().trim(),
        site: ''
      }
      chrome.runtime.sendMessage(params)
    }
  }
  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function shopeeId() {
  const event = (a) => {
    const childEl = $(a.target).parents('.el-table__row')
    const parentEl = childEl.parents('tr').prev('.el-table__row.expanded')
    if (childEl[0] && parentEl[0]) {
      const params = {
        code: 'shopee_search_id',
        id: childEl.find('td:nth-child(2) .cell').text().trim(),
        title: parentEl.find('td:not(.el-table-column--selection)').eq(6).find('.cell div:first-child').text().trim(),
        site: parentEl.find('.data-wrap').attr('data-site_code')
      }
      chrome.runtime.sendMessage(params)
    }
  }
  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function rakutenId() {
  const event = (a) => {
    const childEl = $(a.target).parents('.el-table__row')
    const parentEl = childEl.parents('tr').prev('.el-table__row.expanded')
    if (childEl[0] && parentEl[0]) {
      const params = {
        code: 'rakuten_search_id',
        id: childEl.find('td:nth-child(1)').eq(0).text().trim() || childEl.find('td:nth-child(2)').eq(0).text().trim(),
        title: parentEl.find('td:not(.el-table-column--selection)').eq(5).text().trim()
      }
      chrome.runtime.sendMessage(params)
    }
  }
  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function yahooSearchId() {
  const event = (a) => {
      const parentEl = $(a.target).parents('.divGray')
      if (parentEl.eq(0)) {
          const params = {
              code: 'yahoo_search_id',
              id: parentEl.find('>div:nth-child(4)').text().trim(),
              title: parentEl.find('.iDiv3').text().trim(),
              site: parentEl.find('>div:nth-child(7)').text().trim()
          }

          if (params.id) {
              // console.log(params)
              chrome.runtime.sendMessage(params)
          }
      }
  }

  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function wishSearchId() {
  const event = (a) => {
      const parentEl = $(a.target).parents('.divGray')
      if (parentEl.eq(0)) {
          const params = {
              code: 'wish_search_id',
              id: parentEl.find('>div:nth-child(3)').text().trim(),
              title: parentEl.find('.iDiv7').text().trim(),
              site: parentEl.find('>div:nth-child(9)').text().trim()
          }

          if (params.id) {
              console.log(params, 'param')
              chrome.runtime.sendMessage(params)
          }
      }
  }

  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

function joomSearchId() {
  const event = (a) => {
      const parentEl = $(a.target).parents('.item')
      if (parentEl.eq(0)) {
          const params = {
              code: 'joom_search_id',
              id: parentEl.find('div:nth-child(4)').html().split('<br>')[0].trim(),
              title: parentEl.find('div:nth-child(5)').text().trim(),
              site: parentEl.find('div:nth-child(8)').text().trim(),
          }
          chrome.runtime.sendMessage(params)
      }


  }
  document.removeEventListener('mouseover', event)
  document.addEventListener('mouseover', event)
}

