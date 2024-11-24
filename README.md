<div align="center">
  <img align="center" width="180" src="./images/icon.png" alt="Pinia logo">
</div>
<br/>
<p align="center" style="font-size: 32px">Log Record</p>
<br/>

[中文](./docs/README.zh-CN.md) | English

## 1. Introduction

A system designed for viewing logs in Release environment. This system was developed to address several specific issues encountered during actual development:

1. Test engineers often find it difficult to accurately determine the source of problems during testing;
2. Due to unclear responsibility attribution, many issues are defaulted to frontend developers;
3. Some intermittent issues that occur once may not be reproducible in the short term, making problem localization challenging;
4. Using Charles for network logs every time is too cumbersome.

With this logging system, we can directly view logs to locate issues without requiring testers to repeatedly attempt reproduction. To maximize the system's effectiveness, we recommend recording log information as detailed as possible during daily development, which helps better investigate and resolve various issues.

<span style="color: red; font-style:italic">*Special Note: Avoid using in production unless thoroughly tested.</span>

## 2. Integration

Before using the logging system, you need to integrate [log-listener-plugin](https://github.com/wutiange/log-listener-plugin) into your project. Please refer to the corresponding documentation for specific integration instructions.

[log-listener-plugin](https://github.com/wutiange/log-listener-plugin) only supports [react-native](https://www.reactnative.dev/) projects.

## 3. Usage

Taking `macos` as an example. First, visit this website to download the corresponding version of the software, preferably the latest version as it fixes many previous bugs:

<https://github.com/wutiange/log-record/releases>

![](../images/docs/1729170936543.jpg)

Download the latest version after entering. After downloading, extract:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9a07712aa77a4b8a83af341dc90465db~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1840&h=872&s=129858&e=png&b=e3e6e7)

Double-click to open the logging system. Usually, you'll see this prompt:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/001a6cd2b44b45999e664cf0c718c50a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=520&h=524&s=78682&e=png&b=9b9ea0)

Don't worry, open "Settings", then "Privacy & Security":

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7fd784e63aae4511b1e1de513d6f698b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1430&h=1402&s=385111&e=png&b=ede5e3)

Click "Open" in the popup dialog to complete. Logs will then appear here when reported. For proper display, note that if you're running this system on your computer, ensure your phone's WiFi is on the same network as your computer; and that the `testUrl` for log reporting is successfully set in the `App`. After opening, it looks like this:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3009e5c54cd04fffaf8b30fd340d00f1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2400&h=1200&s=84904&e=png&b=ffffff)

When logs are present, it will look like this:

![](../images/docs/1729169366443.jpg)

Each log entry has a bar beside it representing the log level (`log`, `warn`, `error`), as shown:

![](../images/docs/1729170457548.jpg)

The second part shows the timestamp indicating when the log was printed.

There are two buttons in the bottom right corner: the first clears current screen logs, and the second enables auto-scroll, following new log entries.

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45e4c77efa7048d38397de6441eca5c0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1190&h=580&s=67234&e=png&b=fefefe)

A great feature is the search functionality, which supports simultaneous searches using AND logic. For example, to search for logs containing "App":

![](../images/docs/1729170589153.jpg)

If you want to narrow down results to include both "App" and "background", simply separate the terms with a space:

![](../images/docs/1729170642853.jpg)

This feature was implemented based on real development needs. Besides text search, you can filter by error level, phone model, and other parameters defined in your setBaseUrl configuration. Here's an example of filtering by log level:

![](../images/docs/1729170800182.jpg)

Where `level` represents the reported field name and `warn` represents the corresponding value. This format is fixed, with no spaces allowed between them - spaces are treated as AND conditions.

Discovery feature is now supported, refer to [Using Discovery Feature for Log Reporting v1.2.x](docs/1.2.x.en.md) for details.

## 4. Roadmap

- [x] Optimize performance for large log volumes (1.0.6);
- [x] Improve log search functionality (1.0.6);
- [x] Enhance network log viewing experience (1.0.7);
- [x] Add network log clearing feature (1.0.7);
- [x] Support manual update checking (1.0.7);
- [x] Optimize performance for large network log volumes (1.0.8);
- [x] Add network log search feature (1.0.8);
- [x] Add logging system connection prompt (1.0.9);
- [x] Add English version (1.1.0);
- [x] Add dark mode (1.1.0);
- [x] Add discovery mode (1.2.0);
- [ ] Support viewing log call stacks (1.3.0);
- [ ] Support crash log display (1.3.0);
- [ ] Support code analysis for potential issues and optimization suggestions based on log information (1.4.0);