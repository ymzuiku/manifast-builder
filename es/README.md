# manifest-builder

一个 manifest.json 生成器，它会遍历目标路径并且递归输出 hash, 并且使用无头浏览器爬取目标站点，根据请求顺序排序对资源进行排序

## 安装

```sh
$ yarn add manifest-builder -D
```

配置 scripts:

```json
{
  "scripts": {
    "manifest-builder": "manifest-builder"
  }
}
```

## 开始

在项目根目录输入以下命令, 创建配置文件：

```sh
$ yarn manifest-builder init
```

调整配置文件，使用命令执行项目：

```sh
$ yarn manifest-builder --config manifest-builder.js
# or
$ yarn manifest-builder
```

.gitignore 请忽略 chromeCache, 它存储着浏览器的配置

## 配置

`manifest-builder init` 生成的配置文件如下，已有详细注释

```js
module.exports = () => {
  return {
    // 列入资源的类型
    files: 'js|css|jpg|png|jpge',
    // 等待 fastify 启动
    waitServierTime: 500,
    // md5的长度
    md5Length: 7,
    // 是否输出文件尺寸
    useSize: false,
    // 检索的文件夹
    dir: 'build',
    // 输出的文件路径
    out: 'build/precache-manifest.json',
    // 静态服务的端口
    port: 14512,
    // 是否仅输出无头浏览器捕获的资源
    onlyPuppeteer: false,
    // 输入URL列表，会按序使用无头浏览器，自动爬取首URL中请求的资源，根据请求顺序排序
    puppeteerUrls: [
      'http://127.0.0.1:14512/#/home',
      'http://127.0.0.1:14512/#/order/list',
    ],
    // puppeteer的代理配置
    puppeteerProxys: [
      {
        // 可选，匹配请求类型
        method: 'GET',
        // 可选，用于校验请求路径
        metch: new RegExp(`\\/hello-test-proxy\\/`),
        // 可选，用于排除请求路径
        ignore: new RegExp(`\\/ignore-url\\/`), // new RegExp,
        // 可选，用于关闭请求
        abort: false,
        // 可选，目标url
        url: 'https://www.baidu.com',
        // 可选，替换目标url
        replace: 'http://127.0.0.1:14512',
      },
    ],
    // 操作page，进行交互, url 为当前访问的url，page 为当前浏览器Page对象，next 表示执行下一个url，close表示遇到异常进行关闭
    puppeteerDoing: async (url, page, next, close) => {
      await page.setCookie({
        name: 'hello',
        value: 'world',
        domain: '.baidu.com',
      });
      await page.goto(url);
      await page.waitFor(3000);
      next();
    },
    // 获取 package.json 中的版本号
    package: 'package.json',
    // 处理 reduce 的路径
    reduce: (manifest, fetchList) => {
      return manifest;
    },
  };
};
```
