let token = ''
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const getOwnFollowed = async (page = 1, list = []) => {
  const res = await fetch(`/ajax/profile/followContent?page=${page}`, {
    method: 'GET',
    headers: {
      "content-type": 'application/json'
    }
  }).then(res => res.json())
  const users = res.data.follows.users
  if (users.length > 0) {
    list.push(...users)
    await getOwnFollowed(++page, list)
  }
  return list
}

const batchFollow = async (list = [], index = 0) => {
  const followUser = list[index++]
  await fetch(`/ajax/friendships/create`, {
    method: 'POST',
    headers: {
      "content-type": 'application/json;charset=UTF-8',
      "accept": "application/json, text/plain, */*",
      "x-xsrf-token": token
    },
    body: JSON.stringify({
      friend_uid: followUser.id,
      lpage: "profile",
      page: "profile"
    }
    )
  }).then(res => res.json()).then(async (res) => {
    console.log(`[${index + 1}/${list.length}],${res.name},关注成功`)
    if (list.length > 0) {
      await sleep(2000)
      await batchFollow(list, index)
    }
  })
  return list
}

const start = async (t) => {
  token = t
  const list = await getOwnFollowed()
  let unFollowList = JSON.parse(localStorage.getItem('followList')).filter(unFollowItem => list.findIndex(item => item.id === unFollowItem.id) === -1)
  console.log(`获取待关注列表成功,共${unFollowList.length}个`);
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
  })(unFollowList.map(item => item.id))
}

start()
