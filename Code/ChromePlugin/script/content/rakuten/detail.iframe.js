document.addEventListener(
  'DOMContentLoaded',
  function () {
    if(location.href.includes('slider')) {
      return
    }
    if(!location.href.includes('havana_plaid') && !location.href.includes('mqmsystem')) {
      return
    }
    let images = []
    Array.from(document.querySelectorAll('img')).forEach(v => {
      if (v.getAttribute('src') && v.getAttribute('src').length > 10 && /(\.jpg|\.jpeg|\.png|\.gif|\.wbep)/.test(v.getAttribute('src'))) {
        images.push(v.getAttribute('src').replace(/^(https:|http:)?(\/\/)/, 'https:$2'))
      }
    })
    images = images.map(v => {
      return v.replace(/([\w\W]+?)\?+/, '$1')
    })
    chrome.runtime.sendMessage({
      code: 'iframeDesc',
      data: {
        images: images
      }
    })
  },
  true
)