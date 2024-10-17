<div align="center">
  <img align="center" width="180" src="../images/icon.png" alt="Pinia logo">
</div>
<br/>
<p align="center" style="font-size: 32px">日志系统</p>
<br/>

中文 | [English](../README.md)

## 1. 介绍

用于在 release 环境下查看日志的系统。为啥会出现这个系统呢，是因为当初我发现测试工程师在测试过程中出现问题不知道是谁的问题；总是把 bug 都记录在我的头上；同时由于有一些 bug 是偶现的，出现过一次可能下一次就没有了，有日志的情况下不需要测试再次复现，我直接去看这上面的日志就能找到问题。但可能日志不够全，所以在编写代码的过程中尽可能多打日志，方便排查问题。

## 2. 集成

在使用日志系统之前，你首先需要集成 [log-listener-plugin](https://github.com/wutiange/log-listener-plugin) 到你的项目。具体集成教程请参阅对应的文档。

这个项目只支持 [react-native](https://www.reactnative.dev/) 项目。

## 3. 使用

我以 `macos` 为例。首先进入这个网站下载对应的版本的软件，尽量下载最新的版本，因为新版修复了之前的很多 bug ：

<https://github.com/wutiange/log-record/releases>

![](../images/docs/1729170936543.jpg)

进入后下载最新版本即可。下载后解压：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a07712aa77a4b8a83af341dc90465db~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1840&h=872&s=129858&e=png&b=e3e6e7)

双击打开日志系统。但是一般会提示：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/001a6cd2b44b45999e664cf0c718c50a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=520&h=524&s=78682&e=png&b=9b9ea0)

这个时候不要慌，打开“设置”，然后再打开“隐私与安全性”：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fd784e63aae4511b1e1de513d6f698b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1430&h=1402&s=385111&e=png&b=ede5e3)

然后在出现的弹框中点击打开就完成了。接下来只要日志上报这上面就会显示了。要想正常显示在这上面，还需要注意几点，如果这个系统你是在你的电脑上打开的，那么你得保证你的手机 WiFi 跟你的电脑处于同一网络；在 `App` 中成功设置了日志上报的 `testUrl` 。打开之后长这样：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3009e5c54cd04fffaf8b30fd340d00f1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2400&h=1200&s=84904&e=png&b=ffffff)

如果此时有日志，那么就会变成这样：

![](../images/docs/1729169366443.jpg)

其中每一条日志旁边都有一个横条，这个横条代表日志等级，也就是 `log ,warn, error` 这三种日志类型，见图：

![](../images/docs/1729170457548.jpg)


而第二部分则是时间，可以根据这个看出打印的时间。

右下角有两个按钮，第一个是清空当前屏日志，第二个按钮是保持滑动，也就是会跟随日志的增加而滚动。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45e4c77efa7048d38397de6441eca5c0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1190&h=580&s=67234&e=png&b=fefefe)

其中还有一个很好的功能就是搜索，搜索支持同时搜，也就是既有又有的逻辑。打个比方我想搜索包含“App”的日志：

![](../images/docs/1729170589153.jpg)

我发现日志还是很多，于是我想基于“状态”的日志基础上新增“background”这个日志，只需要使用空格分开两段文本就可以完成同事搜索：

![](../images/docs/1729170642853.jpg)

这个是我在平时的开发中有时候有这样的需求，所以写了这个。搜索除了这个功能外，还能过滤错误等级，手机型号等等功能，只要你 setBaseUrl 传入的类型有哪些那就你过滤就可以根据那些来进行，下面我演示根据日志等级过滤。

![](../images/docs/1729170800182.jpg)

其中 `level` 代表上报的字段名，`warn` 代表字段的对应值。这个格式是固定的，中间不能出现空格，空格都当做是且的关系。

## 4. 计划

- [x] 优化日志太多的性能问题（1.0.6）；
- [x] 优化日志搜索（1.0.6）；
- [x] 优化网络日志的查看体验（1.0.7）；
- [x] 新增网络清空功能（1.0.7）；
- [x] 支持手动检查更新（1.0.7）；
- [x] 优化网络日志太多的性能问题，改善体验（1.0.8）；
- [x] 新增网络日志搜索（1.0.8）；
- [ ] 新增连接日志系统提示（1.0.9）；
- [ ] 新增英文版本（1.1.0）；