let token = ''
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
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
  })
  if (list.length > 0) {
    await sleep(1000)
    await batchFollow(list, index)
  }
  return list
}

const start = async (t) => {
  token = t
  const list = JSON.parse(sessionStorage.getItem('followList'))

  await batchFollow(list)
}

start()
