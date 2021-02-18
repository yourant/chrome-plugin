document.addEventListener(
  'DOMContentLoaded',
  function () {
    let desc = document.body.innerHTML.replace(/[\n\t]/g, '').replace(/\s{2,}/g, '')
    desc = desc.replace(
      /(https:|http:)?(\/\/[A-Za-z0-9\-.%_\/]*.(jpg|jpeg|gif|png))/g,
      'https:$2'
    )
    const images = desc.match(/<img[^>]*src=\"[^\"]*\"/g)
    let srcList = []
    if (images.length) {
      srcList = images.filter(v => !v.includes('.gif'))
      srcList = srcList.map(v => {
        return v.replace(/<img[^>]*src=(http|https)?/g, '$1').replace(/\"/g, '')
      })
    }
    desc = desc.replace(/\"/g, '\'')
    // sfc
    chrome.runtime.sendMessage({
      code: 'iframeDesc',
      data: {
        description: desc,
        images: srcList
      }
    })
  },
  true
)