# 微博同步关注列表

> A：待同步账号。B：需要同步的账号

## 起因

微博账号因为不当转发被封号，需要将关注列表导出到新的账号。

##  思路

比对A账号与B账号的关注，过滤出B的未关注账号列表，添加关注。

## 中间的一些坑

1. 关注列表限制

   博主自保护策略，可能只能看到账号的部分关注列表。需要待同步账号登录账号获取。

2. 微博关注接口并发限制

   接口需要设置延时，频率太快会触发微博的限流。

3. 每日最大关注数量

   目测是150，超出后每次关注需要输入验证码

4. 关注接口的请求头

   新版的微博关注接口`https://www.weibo.com/ajax/friendships/create 请求头必须增加xsrf token，否则会报403。

   如果使用旧版的微博关注接口https://weibo.com/aj/f/followed，则不需要。


## 操作步骤

有两种方案对应两种方法

方案1

- 优点：不需要登录A账号，操作步骤少

- 缺点：由于接口限制，可能无法获得完整的关注列表进行关注。

方案2：

- 优点：可以获得完整的关注列表关注。

- 缺点：需要登录A账号，操作步骤多。

### 方案1

1. 前往[微博首页](https://www.weibo.com/)，登录B账号
2. 进入A的首页。
3. `F12`打开开发者工具，在网络中选择任意一个请求，找到请求头中的**x-xsrf-token**，复制`：`后的内容，
4. 在控制台粘贴以下代码，并填入上一步得到的token，回车执行代码，等待控制台提示成功。

> 由于接口限制可能无法获得完整的关注列表

``` javascript
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
```



### 方案2

1. 前往[微博首页](https://www.weibo.com/)，登录A账号
2. `F12`打开开发者工具，在控制台输入以下代码，等待控制台提示成功。

``` javascript
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
  sessionStorage.setItem('followList', JSON.stringify(list))
  console.log(`获取列表成功,共${list.length}个`);
}

start()
```

3. 退出 A 账号，登录 B 账号
4. `F12`打开开发者工具，在网络中选择任意一个请求，找到请求头中的**x-xsrf-token**，复制`：`后的内容，
5. 在控制台粘贴以下代码，并填入上一步得到的token，回车执行代码，等待控制台提示成功。

```javascript
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
    await sleep(2000)
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
```

