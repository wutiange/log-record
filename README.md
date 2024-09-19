将来计划：

- [x] 优化日志太多的性能问题（1.0.6）；
- [x] 优化日志搜索（1.0.6）；
- [x] 优化网络日志的查看体验（1.0.7）；
- [x] 新增网络清空功能（1.0.7）；
- [x] 支持手动检查更新（1.0.7）；
- [x] 优化网络日志太多的性能问题，改善体验（1.0.8）；
- [x] 新增网络日志搜索（1.0.8）；
- [ ] 新增连接日志系统提示（1.0.9）；
- [ ] 新增英文版本（1.1.0）；

## 1、背景

我发现我们公司的 App 基本上都会跟设备交互，跟设备交互就存在很多指令，每条指令的信息对于测试来说是不清楚的，这就导致很多时候测试不能分辨出到底是设备的还是 App 的问题，在这种情况下，一般都是让 App 排查，而 App 排查可能也只是看一下指令返回的内容，根据指令返回的内容来判断问题导致的原因，很有可能只是设备没返回数据或返回的数据不对导致的。因此如果有一个工具能方便在测试的过程中就能看到内容，那么就能方便的判断出到底是谁的问题，从而不用来来回回的排查，浪费时间。

每次测试想看接口返回的数据，都需要抓包，但是抓包本身需要时间设置，同时有时候有些问题是因为开了抓包才导致的问题（又忘记了开启抓包）。

## 2、分析问题

我们可以发现在 web 端不存在这样的问题。一个很重要的原因就是 web 端打开检查后就能方便看到开发打的日志和网站的接口请求。这样测试就可以很方便的看出问题所在。比如之前测试串口通信的网站，当时我们开发把所有跟串口通信的信息都打印出来了，我只需要简单的告诉测试那些日志是指令的，她在测试的过程中就很容易分辨出是指令返回的错误还是本身网站出现的问题。同样的有时候有些问题不知道是不是接口导致的，就可以打开检查中的网络部分，这样就能看到接口返回的数据，通过接口返回的数据来判断是前端的问题还是后台返回的数据不对。

既然前端中这个问题就相当于不存在，那么我能不能做出一个这样的工具能方便查看日志和网络呢，于是我就编写了这个日志系统。这个日志系统是本地的，不会出现在线上，故而不会影响线上。使用起来很简单。

## 3、react-native 集成日志系统

要想让 react-native 支持在日志系统中显示，需要在项目中安装 [log-listener-plugin](https://github.com/wutiange/log-listener-plugin) 。具体集成教程请参阅对应的文档。

## 4、使用日志系统

我以 `macos` 为例。首先进入这个网站下载对应的版本的软件，尽量下载最新的版本，因为新版修复了之前的很多 bug ：

<https://github.com/wutiange/log-record/releases>

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/092057f569974969991306bcc1556534~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2024&h=886&s=112194&e=png&b=ffffff)

进入后下载最新版本即可。下载后解压：

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

这个是我在平时的开发中有时候有这样的需求，所以写了这个。搜索除了这个功能外，还能过滤错误等级，手机型号等等功能，只要你 setBaseUrl 传入的类型有哪些那就你过滤就可以根据哪些来进行，下面我演示根据日志等级过滤。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/38f525fef56042bfb444f9003b393181~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2400&h=1200&s=108566&e=png&b=ffffff)

其中 `level` 代表上报的字段名，`error` 代表字段的对应值。这个格式是固定的，中间不能出现空格，空格都当做是且的关系。
