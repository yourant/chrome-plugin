// document.querySelector('#add-to-import').addEventListener('click', function() {
//   chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, { message: 'calculate' }, function(response) {
      // const code = parseInt(response.code)
      // if (code === 200) {
      //   alert('产品数据采集完成')
      // } else if (code === 30002) {
      //   alert('此产品数据已经采集过，换个产品吧！')
      // } else {
      //   alert(response.message)
      // }
//     })//end  sendMessage
//   }) //end query
// })