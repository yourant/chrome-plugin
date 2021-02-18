var rakutenLogic = {
  // 类目
  fetchCategory() {
    const cat = {
      category_id: [],
      category_name: []
    };
    let dom = document.querySelectorAll('.rGenreTreeDiv a')
    let sdtextLength
    if($(".sdtext")[0]){
      sdtextLength = $(".sdtext")[0].children.length
      $(".sdtext a").each((i, el) => {
        // cat.category_id.push(Number(el.href.substring(0, el.href.lastIndexOf("/")).slice(el.href.substring(0, el.href.lastIndexOf("/")).lastIndexOf("/") + 1)))
        cat.category_name.push($(el).text().trim())
      })
      cat.category_name = cat.category_name.slice(0, sdtextLength)
    }
    
    // 默认只取第一行信息
    // cat.category_tree = cat.category_id.slice(1, sdtextLength)
    return {
      category_id: Number(dom[dom.length-1].getAttribute('href').split('/')[dom[dom.length-1].getAttribute('href').split('/').length -2]),
      category_tree: [],
      category_name: cat.category_name ? cat.category_name.join(">") : ''
    }
  }
}
