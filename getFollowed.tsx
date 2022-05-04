function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

var list = []
const key = 'followList'
const getFollowed = async (page=1,list=[]) => {
  const uid = window.location.pathname.split('/').pop()
  const res = await fetch(`/ajax/friendships/friends?page=${page}&uid=${uid}`, {
    method: 'GET',
    headers: {
      "content-type": 'application/json'
    }
  }).then(res=>res.json())
  if(res.users.length>0){
    list.push(...res.users)
    await getFollowed(++page,list)
  }
  return list
}

const start = async ()=>{
  list = await getFollowed()
  console.log(`获取列表成功,共${list.length}个`);
}

start()

// const key = 'followList'
// var list = []
// const getOwnFollowed = async (page=1,list=[]) => {
//   const res = await fetch(`/ajax/profile/followContent?page=${page}`, {
//     method: 'GET',
//     headers: {
//       "content-type": 'application/json'
//     }
//   }).then(res=>res.json())
//   const users=res.data.follows.users
//   if(users.length>0){
//     list.push(...users)
//     // await sleep(500)
//     await getOwnFollowed(++page,list)
//   }
//   return list
// }

// const start = async ()=>{
//  list = await getOwnFollowed()
//  sessionStorage.setItem('followList',JSON.stringify(list))
// }

// start()




const batchFollow = async (list=[],index=0) => {
  const followUser = list[index++]
  await fetch(`/ajax/friendships/create`, {
    method: 'POST',
    headers: {
      "content-type": 'application/json;charset=UTF-8',
      "accept":"application/json, text/plain, */*",
      "x-xsrf-token": token
    },
    body:JSON.stringify({
      friend_uid: followUser.id,
      lpage: "profile",
      page: "profile"
    }
    )
  }).then(res=>res.json()).then((res)=>{
    console.log( `[${index+1}/${list.length}],${res.name},关注成功`)
  })
  if(list.length>0){
    await sleep(1000)
    await batchFollow(list,index)
  }
  return list
}

const batchFollowStart = async ()=>{
  batchFollow(list)
 }
 
 batchFollowStart()
 