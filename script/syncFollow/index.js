let list = []
let token = ''
let key = 'followList'
const getFollowed = async (page = 1, list = []) => {
  const uid = window.location.pathname.split('/').pop()
  const res = await fetch(`/ajax/friendships/friends?page=${page}&uid=${uid}`, {
    method: 'GET',
    headers: {
      "content-type": 'application/json'
    }
  }).then(res => res.json())
  if (res.users.length > 0) {
    list.push(...res.users)
    await getFollowed(++page, list)
  }
  return list
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const batchFollow = async (list = [], index = 0) => {
  const followUser = list[index]
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
    console.log(`[${++index}/${list.length}],${res.name},关注成功`)
  })
  if (list.length > 0) {
    await sleep(1000)
    await batchFollow(list, index)
  }
  return list
}

const start = async (t) => {
  token = t
  list = (await getFollowed()).filter(item => !item.following)
  console.log(`获取列表成功,共${list.length}个`);
  batchFollow(list)
}
start("(复制的token)") //例如：start("ApMq0KHPGo3SBclIGe6dMpn7")