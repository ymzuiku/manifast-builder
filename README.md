# precache-manifest-builder

一个用不使用依赖注入达到和 nest 类似的方案，使用 fastify

## 开始

在命令行出入以下命令：

```js
fastify-cli(){
git clone --depth=1 git@github.com:ymzuiku/fastify-cli.git $1 &&
  cd $1 && rm -rf .git && yarn
}
fastify-cli <your-project>
```
