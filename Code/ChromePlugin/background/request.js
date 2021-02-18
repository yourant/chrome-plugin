function request(obj, res) {
  const setting = {
    url: obj.url,
    method: obj.method,
    timeout: 60000,
    data: obj.data
  }
  if (obj.dataType === 'json') {
    setting.headers = {
      'Content-Type': 'application/json'
    }
    setting.dataType = 'json'
    setting.data = JSON.stringify(request.data)
  }
  if (obj.headers) {
    Object.assign(setting.headers, obj.headers)
  }
  $.ajax(settings2).done((response) => {
    res(response)
  }).fail((response) => {
    console.log(123)
  })
}