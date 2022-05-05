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
  }).then(res => res.json()).then((res) => {
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
  await batchFollow(unFollowList)
}

start()
