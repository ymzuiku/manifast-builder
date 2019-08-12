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
