document.addEventListener(
  'DOMContentLoaded',
  function () {
    let desc = document.querySelector('#ds_div').outerHTML.replace(/[\n\t]/g, '')
    desc = desc.replace(/\n+/g, '').replace(/\t/g, '').replace(/\"/g, '\'').replace(
      /(https:|http:)?(\/\/[A-Za-z0-9\-.\/]*\.(jpg|jpeg|gif|png))/g,
      'https:$2'
    ).replace(/(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)|(?<=<a\s*.*href=')[^']*(?=')/gi, 'javascript:;').replace(/(<br>){2,}|(<br\/>){2,}/, '<br>').replace(/\?+/g, '')
    // sfc
    let images = []
    Array.from(document.querySelectorAll('#ds_div img')).forEach(v => {
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
        description: desc,
        images: images
      }
    })
  },
  true
)