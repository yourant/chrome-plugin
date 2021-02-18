const baseUrl = ''
let powerSysUserCode = ''
let from_ids = {}
const environment = 'local'
// 
const platformUrl = {
  'amazon': 'http://istore.szecommerce.com/amazon/api/asiniscompany?token=2838236da7f8debb75ce20eca932aa3ce8d4e1e9a6288bc12fe7e9b3e208128c',
  'ebay': 'http://120.78.211.206:8000/Istore/Advt/AdvtIsIn',
  'lazada': 'http://istore.szecommerce.com/product/advt/is-existed',
  'aliexpress': 'http://istore.szecommerce.com/product/advt/is-existed'
}

function checkLogin() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('loginInfo', async (loginInfo) => {
      const str = JSON.stringify(loginInfo)
      if (str && str !== '{}') {
        $.ajax({
          url: 'http://47.112.12.109:8443/user-service/userSystemMap/get/userId/forlogin',
          method: 'GET',
          timeout: 60000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ loginInfo.loginInfo.token }`
          }
        }).done((res) => {
          if (res && res.data) {
            resolve(loginInfo.loginInfo.userInfo)
          } else {
            chrome.storage.sync.remove('loginInfo', function() {
              handlePopup('noLogin')
              resolve(false)
            })
          }
        }).fail((err) => {
          resolve(false)
        })
      } else {
        resolve(false)
      }
    })
  })
}

// url 验证
async function regUrl(url, isLogin) {
  let html = 'login'
  if (isLogin === 'isLogin') {
    html = 'default'
  } else if (isLogin === 'noLogin') {
    html = 'login'
  } else {
    const loginEd = await checkLogin()
    if (loginEd) {
      html = 'default'
    }
  }
  if (html === 'login') {
    return 'login'
  }
  if (/^https:\/\/\w*\.wish\.com/.test(url)) {
    html = 'incompatible'
    if (/^https:\/\/\w*\.wish\.com$/.test(url)) {
      html = 'category'
    }
    if (/^https:\/\/\w*\.wish\.com\/feed\/tabbed_feed_latest/.test(url)) {
      html = 'category'
    }
    if (/^https:\/\/\w*\.wish\.com\/merchant/.test(url)) {
      html = 'category'
    }
    if (/^https:\/\/\w*\.wish\.com\/feed\/tabbed_feed_latest\/product\//.test(url)) {
      html = 'detail'
    }
    if (/^https:\/\/\w*\.wish\.com[\w\W]+product\//.test(url)) {
      html = 'detail'
    }
  } else if (/^https:\/\/\w.*amazon.com/.test(url)) {
    html = 'incompatible'
    if (/^https:\/\/\w.*amazon.com\/\-\/zh\//.test(url)) {
      html = 'detail'
    }
  } else if (/^https:\/\/\w.*shopee\.(com.my|sg|tw|co.id|co.th|vn|ph|com.br)/.test(url)) {
    html = 'incompatible'
    if (/^https:\/\/\w.*shopee\.(com.my|sg|tw|co.id|co.th|vn|ph|com.br)/.test(url)) {
      html = 'detail'
    }
  }
  return html
}

// 页面切换
function handlePopup(isLogin) {
  chrome.tabs.query({
    active: true,
    currentWindow: true,
    windowId: chrome.windows.WINDOW_ID_CURRENT
  }, async (tabs) => {
    const fileName = await regUrl(tabs[0].url, isLogin)
    const html = `popups/${ fileName }.html`
    if (['popups/category.html', 'popups/detail.html'].includes(html)) {
      chrome.browserAction.setIcon({
        path: 'assets/images/icon_default.png',
        tabId: tabs[0].id
      })
    }
    chrome.browserAction.setPopup({
      popup: html,
      tabId: tabs[0].id
    })
  })
}

// 激活
chrome.tabs.onActivated.addListener(handlePopup)
// 变更
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    handlePopup()
  }
})

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.code) {
    case 'iframeDesc': {
      chrome.tabs.sendMessage(sender.tab.id, {
        code: 'desc',
        data: request.data
      })
    }
      break

    /*
     * save接口，保存数据到mysql
     * */
    case '0': {
      chrome.webRequest.onCompleted.removeListener(chromeListener)
      /* 存储抓取数据 */
      const settings = {
        // 'url': 'http://124.89.91.49:8000/spider/api/product/save', // 测试地址（外网）
        'url': 'http://190.168.3.228:8000/spider/api/product/save', // 测试地址（内网）
        // 'url': 'http://api.spider.szecommerce.com/api/product/save', // 生产地址，在publish分支使用
        'method': 'POST',
        'timeout': 60000,
        'headers': {
          'Content-Type': 'application/json'
        },
        'data': JSON.stringify(request.data),
        dataType: 'json'
      }
      $.ajax(settings).done(function(response) {
        sendResponse(response)
        let product_id = ''
        if (response.data.product_id) {
          product_id = '，product_id: ' + response.data.product_id
        }
        const endTime = new Date().getTime()
        const logData = JSON.parse(JSON.stringify(request.data))
        logData.collect_time = endTime - request.startTime
        logData.is_manual_id = request.is_manual_id
        console.log('采集花费时间(ms)：' + logData.collect_time, '手动输入ID：' + logData.is_manual_id)
        recodeLog({
          platform: request.data.platform,
          url: request.data.platform_url,
          code: response.code,
          message: response.message + product_id,
          data: logData,
          children: request.data.platform === 'jd' && request.data.children && request.data.children.length ? request.data.children.toString() : ''
        })
      }).fail(function(file) {
        sendResponse(file)
      })
      return true
    }
    /*
     * 验证产品是否是istore的产品
     * 只针对采集关联istore id时验证，不通过不采集
     * */
    case 'haveProduct': {
      chrome.webRequest.onCompleted.removeListener(chromeListener)
      /* 存储抓取数据 参数platform 、es_local  不分平台站点写死 ebay  US*/
      const settings = {
        'url': 'http://47.107.131.110:8000/OpenAPIController/http',
        'method': 'POST',
        'timeout': 60000,
        'data': request.data
      }
      $.ajax(settings).done(function(response) {
        sendResponse(response)

      }).fail(function() {
        sendResponse('error')
      })
      return true
    }

    /*
     * 验证广告是否是istore的广告
     * 支持平台：amazon、ebay、lazada、aliexpress
     * */
    case 'haveAdvt': {
      chrome.webRequest.onCompleted.removeListener(chromeListener)
      /* 存储抓取数据 */
      let settings2 = {
        // 'url': 'http://120.78.211.206:8000/Istore/Advt/AdvtIsIn',
        'url': platformUrl[request.data.platform],
        'method': 'POST',
        'timeout': 60000,
        'data': request.data
      }
      if (['aliexpress', 'lazada'].includes(request.data.platform)) {
        settings2.method = 'GET'
      }
      $.ajax(settings2).done(function(response) {

        sendResponse(response)

      }).fail(function(response) {
        sendResponse('error')
      })
      return true
    }

    /*
     * 检查是否是新平台广告
     * 支持平台：coupang、rakuten、kr11street、shopee广告
     * */
    case 'checkAdvt': {
      $.ajax({
        'url': 'http://47.106.238.92:8000/business/advt/exists',
        'method': 'POST',
        'timeout': 60000,
        'headers': {
          'X-Allow-Response': '61af2d2c758afb4b7c30bdd4fad6df42',
          'Content-Type': 'application/json'
        },
        'data': JSON.stringify(request.data),
        dataType: 'json'
      }).done(function(response) {
        sendResponse(response)
      }).fail(function(response) {
        sendResponse('error')
      })
      return true
    }

    /*
     * 检查是否是目录CategoryId
     * 验证目录是否存在，各级目录都需验证（只针对ebay平台）
     * */
    case 'checkedCategoryId': {
      let params = {
        url: 'http://120.78.211.206:8000/api/specifics/example',
        method: 'POST',
        timeout: 60000,
        data: request.data
      }
      $.ajax(params).done(function(response) {
        sendResponse(response)
      }).fail(function(response) {
        if (response.statusText === 'timeout') {
          sendResponse({ type: 'timeout' })
        } else {
          if (response.status !== 200) {
            sendResponse({ type: response.status, msg: `验证${ request.data.category_id }目录不可用!` })
          } else {
            sendResponse({ type: 'error' })
          }
        }
      })
      return true
    }

    /*
     * 检查是否是gmarket、 wish、joom、yahoo广告
     * */
    case 'checkedAdvt': {
      let params = {
        url: 'http://47.107.131.110:8000/OpenAPIController/http',
        method: 'POST',
        timeout: 60000,
        data: request.data
      }
      $.ajax(params).done(function(response) {
        sendResponse(response)
      }).fail(function(response) {
        if (response.status !== 200) {
          sendResponse({ type: response.status, msg: `验证${ request.data.platform }广告服务不可用,请稍后再试!` })
        } else {
          sendResponse({ type: 'error' })
        }
      })
      return true
    }

    /*
     * 检测当前版本是否过期
     * */
    case 'checkVersion': {
      if (environment === 'local') {
        chrome.storage.sync.set({ version: 'local' })
        sendResponse('meet')
        return
      }
      $.ajax({
        url: 'http://xian.suntekcorps.com:8824/Version/LatestVersion?project=spidersystem-chromeplugin',
        method: 'GET',
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      }).done((res) => {
        if (res.data && res.data.data) {
          let version = null
          $.get(chrome.extension.getURL('manifest.json'), function(info) {
            version = info.version
            chrome.storage.sync.set({ version: version })
            if (res.data.data.version !== version) {
              sendResponse('later')
              return
            } else {
              sendResponse('meet')
            }
          }, 'json')
        } else {
          sendResponse('meet')
        }
      }).fail((err) => {
        sendResponse('meet')
      })
      return true
    }

    /*
     * 接收detail.us消息，获取权限系统cookie的工号放到每个ajax请求头部做登录验证
     * */
    case 'getUserCode': {
      chrome.storage.sync.get('loginInfo', async (loginInfo) => {
        const str = JSON.stringify(loginInfo)
        if (str && str !== '{}') {
          $.ajax({
            url: 'http://47.112.12.109:8443/user-service/userSystemMap/get/userId/forlogin',
            method: 'GET',
            timeout: 60000,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ loginInfo.loginInfo.token }`
            }
          }).done((res) => {
            if (res && res.data) {
              sendResponse(loginInfo.loginInfo.userInfo)
            } else {
              chrome.storage.sync.remove('loginInfo', function() {
                handlePopup('noLogin')
                sendResponse(false)
              })
            }
          }).fail((err) => {
            sendResponse(false)
          })
        } else {
          sendResponse(false)
        }
      })
      return true
    }
    case 'save_from_id' : {
      from_ids[request.href] = request.from_id
      from_ids[request.referrer] = request.from_id
    }
      break
    case 'get_from_id' : {
      let from_id = from_ids[request.referrer] || from_ids[request.href]
      from_ids[request.href] = from_id
      sendResponse({ from_id: from_id })
    }
      break
    case 'del_from_id': {
      // let key = request.referrer || request.href
      // 清除 列表页和详情页都带有from_id
      if (from_ids[request.referrer]) {
        delete from_ids[request.referrer]
      }

      if (from_ids[request.href]) {
        delete from_ids[request.href]
      }

      sendResponse(from_ids)
    }
      break

    default:
      // recodeLog({
      //   platform: request.data.platform,
      //   url: request.data.platform_url,
      //   code: response.code,
      //   message: response.message + (response.code === 'success' ? (',' + 'product_id:' + response.data.product_id) : ''),
      //   data: request.data,
      //   children: request.data.platform === 'jd' && request.data.children && request.data.children.length ? request.data.children.toString() : ''
      // })
      sendResponse('')
      return true
  }
})

function recodeLog(msg) {
  msg.type = 'detail_chrome'
  const settings = {
    // 'url': 'http://124.89.91.49:8000/egg-collect/log/log', // 测试地址（外网使用）
    'url': 'http://190.168.3.228:8000/egg-collect/log/log', // 测试地址（内网使用）
    // 'url': 'http://47.106.238.92:8000/log/log', // 生产地址（publish分支使用）
    'method': 'POST',
    'timeout': 60000,
    'headers': {
      'Content-Type': 'application/json'
    },
    'data': JSON.stringify(msg),
    dataType: 'json'
  }
  $.ajax(settings).always(function(response) {
    console.log(response)

  })
}

function chromeListener(data) {
  chrome.tabs.sendMessage(data.tabId, {
    code: 'collect'
  }, function(response) {
    console.log(response)
  })
}