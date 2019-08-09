# manifest-builder

一个 manifest.json 生成器，它会遍历目标路径并且递归输出hash, 并且使用无头浏览器爬取目标站点，根据请求顺序排序对资源进行排序

## 开始

在项目根目录输入以下命令, 创建配置文件：

```sh
$ manifest-builder init
```

使用命令执行项目：

```sh
$ manifest-builder --config manifest-builder.js
# or
$ manifest-builder
```
