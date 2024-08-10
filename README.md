将来计划：
- [x] 优化日志太多的性能问题（1.0.6）；
- [x] 优化日志搜索（1.0.6）；
- [ ] 优化网络日志太多的性能问题，改善体验（1.0.7）；
- [ ] 新增网络日志搜索（1.0.7）；
- [ ] 新增英文版本（1.1.0）；
- [ ] 筹备基于 websocket 协议的日志系统，做到双向控制（2.0.0）。



## 1、背景

我发现我们公司的 App 基本上都会跟设备交互，跟设备交互就存在很多指令，每条指令的信息对于测试来说是不清楚的，这就导致很多时候测试不能分辨出到底是设备的还是 App 的问题，在这种情况下，一般都是让 App 排查，而 App 排查可能也只是看一下指令返回的内容，根据指令返回的内容来判断问题导致的原因，很有可能只是设备没返回数据或返回的数据不对导致的。因此如果有一个工具能方便在测试的过程中就能看到内容，那么就能方便的判断出到底是谁的问题，从而不用来来回回的排查，浪费时间。

每次测试想看接口返回的数据，都需要抓包，但是抓包本身需要时间设置，同时有时候有些问题是因为开了抓包才导致的问题（又忘记了开启抓包）。

## 2、分析问题

我们可以发现在 web 端不存在这样的问题。一个很重要的原因就是 web 端打开检查后就能方便看到开发打的日志和网站的接口请求。这样测试就可以很方便的看出问题所在。比如之前测试串口通信的网站，当时我们开发把所有跟串口通信的信息都打印出来了，我只需要简单的告诉测试那些日志是指令的，她在测试的过程中就很容易分辨出是指令返回的错误还是本身网站出现的问题。同样的有时候有些问题不知道是不是接口导致的，就可以打开检查中的网络部分，这样就能看到接口返回的数据，通过接口返回的数据来判断是前端的问题还是后台返回的数据不对。

既然前端中这个问题就相当于不存在，那么我能不能做出一个这样的工具能方便查看日志和网络呢，于是我就编写了这个日志系统。这个日志系统是本地的，不会出现在线上，故而不会影响线上。使用起来很简单。

## 3、react-native 集成日志系统

要想让 react-native 支持在日志系统中显示，需要在项目中安装下面的库：

```bash
npm install @wutiange/log-listener-plugin
# 对于 yarn
yarn add @wutiange/log-listener-plugin
```

这个库并没有什么花里胡哨的代码，就是将上报日志的逻辑进行了封装。

接下里需要在代码中进行初始化：

```ts
logger.setBaseUrl(await getTestUrl())
logger.setBaseData({
  env,
  version: displayVersion,
  brand: DeviceInfo.getBrand(),
  model: DeviceInfo.getModel(),
  appVersion: DeviceInfo.getVersion(),
  carrier: DeviceInfo.getCarrierSync(),
  manufacturer: DeviceInfo.getManufacturerSync(),
  systemName: DeviceInfo.getSystemName(),
  uniqueId: DeviceInfo.getUniqueId(),
})
```

其中 `testUrl` 就是日志应用所在的 `IP` 地址，而 `baseData` 则是每条日志包含的基础信息。假如你的日志系统是在自己电脑上打开的，那么这里的 `testUrl` 就是你电脑的地址。

要想上报日志，那么调用以下方法即可：

```ts
import logger from '@wutiange/log-listener-plugin'
logger.log("日志信息")
logger.warn("警告信息")
logger.error("错误信息")
```

要想上报网络信息，那么：

```ts
import logger from '@wutiange/log-listener-plugin'
// 其中 input 和 init 跟 fetch 函数的参数相同
const logReqId = await logger.req(input, init)
// 其中 logReqId 就是 req 返回的 id ； response 则是通过 fetch 请求返回的结果
logger.res(Number(logReqId), response.clone())
```

做了这些以后，基本上就完成了。但还是要注意一下，其中 `testUrl` 和 `baseData` 不能为空，由于 App 刚开始的时候这些值可能是空的，那么你就需要保证不为空的时候才初始化。参考我使用的方式：

```ts
import DeviceInfo from 'react-native-device-info'
import logger from '@wutiange/log-listener-plugin'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { displayVersion } from '@/../app.json'
import { buildType } from './bridge/SenseCAP'

let testUrl = ''
const testUrlKey = '__testUrl__'
export function setTestUrl(url) {
  let tempUrl = url
  if (tempUrl !== '' && tempUrl.indexOf('http://') !== 0) {
    tempUrl = `http://${tempUrl}`
  }
  testUrl = tempUrl
  // 设置 url 的时候同时保存到本地
  AsyncStorage.setItem(testUrlKey, testUrl)
  logger.setBaseUrl(testUrl)
}

export async function getTestUrl() {
  // 如果没有值，那么从本地取
  if (!testUrl) {
    testUrl = await AsyncStorage.getItem(testUrlKey)
  }
  return testUrl
}

async function initLogger() {
  /*
  获取构建环境字符串，我们采用了热更新，所以这里是
  debug staging release
  */
  const env = await buildType()
  logger.setBaseUrl(await getTestUrl())
  logger.setBaseData({
    env,
    version: displayVersion,
    brand: DeviceInfo.getBrand(),
    model: DeviceInfo.getModel(),
    appVersion: DeviceInfo.getVersion(),
    carrier: DeviceInfo.getCarrierSync(),
    manufacturer: DeviceInfo.getManufacturerSync(),
    systemName: DeviceInfo.getSystemName(),
    uniqueId: DeviceInfo.getUniqueId(),
  })
}

// 防止调用的地方由于没有设置 url 导致报错，这里统一处理
export function getLogger() {
  if (testUrl) {
    return logger
  }
}

// 这样我在使用的地方就这样
getLogger()?.log(message, ...optionalParams)
```

完成上面这些 `react-native` 应用就具备日志查看的能力了。

在版本 `1.1.9` 中新增全新的一种方式，这种方式更简单。只需要导入两个文件就能自动承接 `console` 和 `fetch` ，这样就不需要在对应的位置操作了，项目就跟之前一样不需要添加任何其他代码。当然由于上传日志需要 `IP` ，所以 `IP` 必须设置的，也就是上面的 `testUrl` ，至于 `baseData` 也是需要设置的，只不过这些都不是强制要求。

```js
// console 的接管
import '@wutiange/log-listener-plugin/dist/console'
// fetch 的接管
import '@wutiange/log-listener-plugin/dist/fetch'


let testUrl = ''
const testUrlKey = '__testUrl__'
export function setTestUrl(url) {
  let tempUrl = url
  if (tempUrl !== '' && tempUrl.indexOf('http://') !== 0) {
    tempUrl = `http://${tempUrl}`
  }
  testUrl = tempUrl
  AsyncStorage.setItem(testUrlKey, testUrl)
  logger.setBaseUrl(testUrl)
}

export async function getTestUrl() {
  if (!testUrl) {
    testUrl = await AsyncStorage.getItem(testUrlKey)
  }
  return testUrl
}

async function initLogger() {
  const env = await buildType()
  logger.setBaseUrl(await getTestUrl())
  logger.setTimeout(10000)
  logger.setBaseData({
    env,
    version: displayVersion,
    brand: DeviceInfo.getBrand(),
    model: DeviceInfo.getModel(),
    appVersion: DeviceInfo.getVersion(),
    carrier: DeviceInfo.getCarrierSync(),
    manufacturer: DeviceInfo.getManufacturerSync(),
    systemName: DeviceInfo.getSystemName(),
    deviceUniqueId: DeviceInfo.getUniqueId(),
  })
}

initLogger()
```

在 `index.js` 入口文件中添加上面代码就可以了，其余的都不用管了。我上面之所以会对 `testUrl` 进行包装是因为，我 `app` 设置中可以手动设置，这样方便切换。

## 4、使用日志系统

我以 `macos` 为例。首先进入这个网站下载对应的版本的软件：

<https://github.com/wutiange/log-record/releases>

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/092057f569974969991306bcc1556534~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2024&h=886&s=112194&e=png&b=ffffff)

进入后下载最新版本即可，截止我写这个博文的时间，最新版本为 `1.0.0` 。下载后解压：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a07712aa77a4b8a83af341dc90465db~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1840&h=872&s=129858&e=png&b=e3e6e7)

双击打开日志系统。但是一般会提示：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/001a6cd2b44b45999e664cf0c718c50a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=520&h=524&s=78682&e=png&b=9b9ea0)

这个时候不要慌，打开“设置”，然后再打开“隐私与安全性”：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fd784e63aae4511b1e1de513d6f698b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1430&h=1402&s=385111&e=png&b=ede5e3)

然后在出现的弹框中点击打开就完成了。接下来只要日志上报这上面就会显示了。要想正常显示在这上面，还需要注意几点，如果这个系统你是在你的电脑上打开的，那么你得保证你的手机 WiFi 跟你的电脑处于同一网络；在 `App` 中成功设置了日志上报的 `testUrl` 。打开之后长这样：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3009e5c54cd04fffaf8b30fd340d00f1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2400&h=1200&s=84904&e=png&b=ffffff)

接下来我以我们公司的 `Hotspot App` 为例来讲怎么设置 `testUrl` ，要想使用具体以 `App` 是怎么展现的为主。

打开“`User`”页面，找到“`log address`”这一栏，然后长按右边的值，右边就处于编辑状态。然后输入对应的 `IP` 就可以了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2eac6176921c440b966712d581786157~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1150&h=1100&s=196033&e=png&b=13151c)

成功设置后再打开 App ，如果此时有日志，那么就会变成这样：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/470f5a838ef5429f8bdc11ee45e1c8e0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2400&h=1200&s=205734&e=png&b=fdfdfd)

每条日志都只会显示一行，如果要看详情点击具体那一项即可。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/50e67fc2a59b4f61a2f272fd83692b8c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2400&h=1200&s=235248&e=png&b=fcfcfc)

其中每一条日志旁边都有一个横条，这个横条代表日志等级，也就是 `log ,warn, error` 这三种日志类型，见图：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b12dedae546b4b06bcd8c205159b95de~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=830&h=676&s=88821&e=png&b=fbfbfb)

而第二部分则是时间，这里的时间是时分秒。其中右下角有两个按钮，第一个是清空当前屏日志，第二个按钮是保持滑动，也就是会跟随日志的增加而滚动。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45e4c77efa7048d38397de6441eca5c0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1190&h=580&s=67234&e=png&b=fefefe)

其中还有一个很好的功能就是搜索，搜索支持同时搜，也就是既有又有的逻辑。打个比方我想搜索包含“状态”的日志：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a81d294af2f47f28d292ed71ed152c8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2400&h=1200&s=190066&e=png&b=fdfdfd)

我发现日志还是很多，于是我想基于“状态”的日志基础上新增“active”这个日志，只需要使用空格分开两段文本就可以完成同事搜索：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/614ece831bc34d27a4815d878d4dd93b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2400&h=1200&s=129525&e=png&b=ffffff)

这个是我在平时的开发中有时候有这样的需求，所以写了这个。搜索除了这个功能外，还能过滤错误等级，手机型号等等功能，只要你上传的类型有哪些那就你过滤就可以根据哪些来进行，下面我演示根据日志等级过滤。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/38f525fef56042bfb444f9003b393181~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2400&h=1200&s=108566&e=png&b=ffffff)

其中 `level` 代表上报的字段名，`error` 代表字段的对应值。这个格式是固定的，中间不能出现空格，空格都当做是且的关系。

## 5、日志系统具体逻辑分析

这个项目是 electron + vue3 + typescript 来实现的。接下来先说明目录结构。

### 5.1、系统目录

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a9922148aca941d68abeecd6ed13fcdd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=934&h=902&s=113336&e=png&b=ffffff)

这个客户端最主要的就是开启一个服务，然后接收来至于 App 上报的数据，主要配置了两个路由，一个是日志，一个是网络。

### 5.2、本地服务

服务的代码主要看 server 这个文件。

```ts
class ServerClient {
  private app: Express | null = null
  private runningServer: Server<typeof IncomingMessage, typeof ServerResponse> | null = null
  constructor() {
    this.app = express();
    this.app.use(express.json())
  }

  startListen(pathHandle: Record<string, (msg: Record<string, unknown>) => void> = {}) {
    this.stopListen()
    let id = 0;
    Object.entries(pathHandle).forEach(([path, handle]) => {
      this.app.post(path, function (req, res) {
        handle({ id: ++id, ...req.body })
        res.end(id.toString());
      });
    })

    this.runningServer = this.app.listen(httpPort);
  }

  stopListen() {
    // 当服务还在运行的时候，在关闭对话框的过程中需要把服务也关闭
    if (this.runningServer?.listening) {
      this.runningServer.close()
    }
  }
}
export default new ServerClient()
```

其中全是 `post` 请求，并且成功以后返回对应的 `id` ，目前 `id` 是本地递增的。只支持 `body` 的类型是 `json` 数据格式。要想启动服务，在 `main.ts` 中调用 `startListen` 来开启。

```ts
serverClient.startListen({
  '/log': (msg) => {
    mainWindow.webContents.send('log:msg', msg)
  },
  '/network': (msg) => {
    mainWindow.webContents.send('network:msg', msg)
  }
})
```

这里主要就是两个，一个是日志一个是网络。

### 5.3、搜索算法

对于整个系统来说，最重要的就是搜索，其他的都只是界面层面的。好的搜索能方便查询到自己想看到的信息。

搜索最重要的就是过滤信息。下面就具体说一说搜索的实现。普通的搜索很好弄，也就是查找子字符串，查询得到就过滤。最主要的是同时满足，也就是我搜索的两个字符串同时满足。还有就是这个搜索还能按条件搜索，比如我上传的有一个字段叫 `version` ，也就是版本号，我想只看版本号为 `1.0.0` 的。

我是这样定的，所有的搜索都是采用 `条件:值` 的形式，比如我要根据 `version` 来过滤，那么我就输入 `version:1.0.0` 。其中文本的搜索就是 `text:字符串` 的形式，只不过对于文本来说，不需要写 `text:` ，只需要输入要搜索的字符串即可。

由于我不知道用户具体搜索的内容，所以我拿到用户搜索的字符串后，首先对指令就是处理。

```ts
export function searchTextToCommandsMap(
  searchText: string
): Map<string, string[]> {
  const commandObj = new Map();
  if (!searchText) {
    return commandObj;
  }
  // 先按空格分隔用户搜索的字符串
  const searchArr = searchText.split(" ");
  for (let i = 0; i < searchArr.length; i++) {
    const e = searchArr[i];
    // 如果元素为空，那么就直接跳过，也就是这种情况 <nihao > 其中nihao后面
    // 有空格，这样按空格分隔就会出现空元素
    if (typeof e === 'string' && e.length <= 0) {
      continue;
    }
    // 然后按:来分隔，来看条件和值，如果用户要输入:，那么就需要加上\
    if (e.includes(":") && !e.includes("\:")) {
      // 分隔以后，第一个元素就是条件，第二个就是值
      const commandArr = e.split(":");
      const command = commandArr[0];
      if (commandArr[1]?.length) {
        const value = commandObj.get(command) ?? [];
        value.push(commandArr[1]);
        commandObj.set(command, value);
      }
    } else {
      // 说明是普通文本，普通文本要将 文本 按照 text:文本 来处理
      const value = commandObj.get("text") ?? [];
      value.push(e);
      commandObj.set("text", value);
    }
  }
  return commandObj;
}
```

其中其他条件过滤很好弄，就是看每一条日志的对应字段是不是对应的值即可。关键在于字符串的处理。

```ts
export function handleTextCommand(
  commandObj: Map<string, string[]>,
  logger: LogType,
  isCaseSensitive = false
) {
  if (commandObj.has("text")) {
    // 先把数组按字符串的长度排序，目的是照顾长的，这样在下面短的自动会被替换掉
    // 也就是如果出现 a ab 这两个，优先显示照顾 ab
    const values = (commandObj.get("text") ?? []).sort(
      (a, b) => a.length - b.length
    );
    const allIndices: Record<string, number> = {};
    for (let i = 0; i < values.length; i++) {
      const val = values[i];
      const indices = findAllSubstringIndices(
        logger.text,
        val,
        isCaseSensitive
      );
      if (!Object.keys(indices).length) {
        return false;
      }
      /**
       * 这里使用对象的目的是为了长的替换短的，比如：{4:5} 这个时候有一个长的是: {4:6}
       * 那么很自然的就会把 {4:5} 替换掉
       */
      Object.assign(allIndices, indices);
    }

    /**
      将对象转换成数组，数组能保证顺序，要先处理字符串后面的下标，这样下标总是有效的
      如果先处理前面的，由于字符串被替换了，导致后面的下标不正确，比如：abc 假如有两个 0, 2
      假如先处理0，把0替换成123，这个时候就变成123bc，这个时候再处理2就会出现错乱
    */
    const tempIndices = convertAndSortRecord(allIndices);

    for (let j = 0; j < tempIndices.length; j += 1) {
      const { index, size } = tempIndices[j];
      const replacement = logger.text.slice(index, index + size);
      logger.text = replaceSubstring(
        logger.text,
        index,
        size,
        swapTextToMark(replacement)
      );
    }

    return true;
  }
}
```

主要就是 `a` `ab` 的问题，还有就是应该从后向前处理，否则导致下标不准确，也许你会想，每一次都重新搜索不就行啦，这样会出现新的问题。