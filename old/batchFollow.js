(list => {
  let index = -1, length = list.length
  const follow = uid => {
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let data = JSON.parse(xhr.responseText)
        if (data.code == 100000)
          console.log(`${index + 1}/${length}`, uid, data.data.fnick, '关注成功')
        else if (data.code == 100001)
          console.log(`${index + 1}/${length}`, uid, '关注失败')
      }
    }
    xhr.open('POST', `/aj/f/followed?ajwvr=6&__rnd=${Date.now()}`)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send(`uid=${uid}&objectid=&f=1&extra=&refer_sort=&refer_flag=1005050001_&location=page_100505_home&oid=${uid}&wforce=1&nogroup=false&fnick=&refer_lflag=&refer_from=profile_headerv6&_t=0`)
  }
  let scheduled = setInterval(() => {
    index += 1
    follow(list[index])
  }, 2000)
  setTimeout(() => {
    clearTimeout(scheduled)
  }, 2000 * length)
})(/*上一步的结果*/)