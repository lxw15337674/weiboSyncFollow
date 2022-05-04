(() => {
  let uid = config.uid, follows = []
  const pageQuery = (page = 1) => {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let data = JSON.parse(xhr.responseText).data
        if (data.msg == '这里还没有内容') return console.log(JSON.stringify(follows))
        data.cards.forEach(card => follows.push(card.user.id))
        pageQuery(page + 1)
      }
    }
    xhr.open('GET', `/api/container/getSecond?luicode=10000011&lfid=100505${uid}&uid=${uid}&containerid=100505${uid}_-_FOLLOWERS&page=${page}`)
    xhr.send()
  }
  pageQuery()
})()