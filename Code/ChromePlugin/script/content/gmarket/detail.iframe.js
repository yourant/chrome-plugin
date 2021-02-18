document.addEventListener(
  'DOMContentLoaded',
  function () {
    let desc = document.querySelector('#basic_detail_html').innerHTML.replace(/[\n\t]/g, '')
    desc = desc.replace(
      /(https:|http:)?(\/\/[A-Za-z0-9\-.%_\/]*.(jpg|jpeg|gif|png))/g,
      'https:$2'
    )
    const images = desc.match(
      /(https:|http:)?(\/\/[A-Za-z0-9\-.%_\/]*.(jpg|jpeg|gif|png))/g
    )
    // sfc
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