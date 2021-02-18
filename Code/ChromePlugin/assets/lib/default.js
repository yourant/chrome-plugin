$(function () {
  $('.btn-box').click(function (e) {
    console.log(e.target.id, e.target.getAttribute('index'))
    $(".item-box").each((i, el) => {
      if (i == e.target.getAttribute('index')) {
        $(el).fadeIn()
      } else {
        $(el).fadeOut()
      }
    })
  })
})