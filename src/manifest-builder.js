module.exports = () => {
  return {
    // 列入资源的类型
    files: 'js|css|jpg|png|jpge',
    // md5的长度
    md5Length: 7,
    // 是否输出文件尺寸
    useSize: false,
    // 检索的文件夹
    dir: 'test_dist',
    // 输出的文件路径
    out: 'test_dist/precache-manifest.json',
    // 输入URL列表，会按序使用无头浏览器，自动爬取首URL中请求的资源，根据请求顺序排序
    puppeteerUrls: ['https://corp.dinghuo123.com/app/index.html#/home'],
    // 操作page，进行交互
    puppeteerDoing: async (url, page, next, fetchList) => {
      //使用 page 对象操作页面，运行 next 关闭当前页面，执行下一个页面
      page.on('console', msg => {
        if (msg.text() === 'done!') {
          next();
        }
      });

      await page.waitFor(5000);
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
