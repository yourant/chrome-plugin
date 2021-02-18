window.onload = function() {
    if ($('#login')[0]) {
      login()
    }
    if ($('.top-account')[0]) {
      setUserInfo()
    }
    if ($('.top-logout-btn')[0]) {
      logout()
    }
  }
  
  $('#login_form').on('input', 'input', function() {
    $('.error-tip').text('').hide()
  })
  
  function login() {
    const _chrome = chrome
    $('#login').unbind('click').on('click', function() {
      const username = $('#username').val().trim()
      const password = $('#password').val().trim()
      if (!username) {
        $('.error-tip').text('请输入账号').show()
        return
      } else if (!password) {
        $('.error-tip').text('请输入密码').show()
        return
      }
      let $btn = $(this).button('loading')
      $btn.button('toggle')
      $.ajax({
        url: 'http://47.112.12.109:8443/user-service/login',
        method: 'POST',
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({ username, password }),
        success: (res) => {
          $btn.button('reset')
          if (res && res.data) {
            _chrome.storage.sync.set({ loginInfo: res.data }, (str) => {
              const bg = _chrome.extension.getBackgroundPage()
              bg.handlePopup('isLogin')
              window.close()
            })
          } else {
            const msg = res && res.message || '登录接口错误'
            $('.error-tip').text(msg).show()
          }
        },
        error: (err) => {
          $btn.button('reset')
          if (err && err.message) {
            $('.error-tip').text(err.message).show()
            // alert(err.message)
          } else {
            $('.error-tip').text('登录接口错误').show()
            // alert('登录接口错误')
          }
        }
      })
    })
    $(document).on('keydown', function(e) {
      if (e.keyCode === 13) {
        $('#login').click()
      }
    })
  }
  
  function setUserInfo() {
    chrome.storage.sync.get('loginInfo', (res) => {
      if (res && res.loginInfo) {
        $('.top-account').text(res.loginInfo.userInfo.name)
      }
    })
  }
  
  function logout() {
    $('.top-logout-btn').unbind('click').on('click', () => {
      chrome.storage.sync.remove('loginInfo', () => {
        const bg = chrome.extension.getBackgroundPage()
        bg.handlePopup()
        window.close()
      })
    })
  }