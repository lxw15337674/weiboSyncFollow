const key = 'followList'
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
    // await sleep(500)
    await getOwnFollowed(++page, list)
  }
  return list
}
const start = async () => {
  const list = await getOwnFollowed()
  localStorage.setItem('followList', JSON.stringify(list.map(item => {
    return { id: item.id }
  })))
  console.log(`获取列表成功,共${list.length}个`);
}
start()