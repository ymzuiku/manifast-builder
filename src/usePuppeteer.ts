import * as puppeteer from 'puppeteer';
import { from, Subject } from 'rxjs';

export let page: puppeteer.Page;
export let brower: puppeteer.Browser;

export const pageClick = async (select: string, wait: number) => {
  const target = await page.$(select);
  target.click();
  await page.waitFor(wait);

  return target;
};

export const initPage = async () => {
  if (!brower) {
    brower = await puppeteer.launch({
      userDataDir: '_chromeCache',
      headless: true,
      ignoreHTTPSErrors: true,
      args: [
        // 关闭沙箱检测，相信目标站点
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // --disable-extensions默认情况下会传递标记，并且在此类策略处于活动状态时将无法启动。要解决此问题，请尝试在没有标志的情况下运行
        '--disable-extensions',
        // 关闭跨域检测
        '--disable-web-security',
      ],
    });
  }

  if (page) {
    page = null;
  }
  page = await brower.newPage();
  await page.setRequestInterception(true);
  await page.setJavaScriptEnabled(true);
};

interface IProxy {
  abort?: boolean;
  ignore: RegExp;
  metch: RegExp;
  method: string;
  replace: string;
  url: string;
}

type IDoing = (url: string, page: puppeteer.Page, next: any, close: any) => any;

export const usePuppeteer = async (
  urls: string[],
  doing: IDoing,
  reg: RegExp,
  proxys?: IProxy[],
): Promise<string[]> => {
  // headless: false 表示打开浏览器，查看过程
  return new Promise(res => {
    const fetchList: string[] = [];

    const sub = new Subject();

    let index = 0;

    const complete = () => sub.complete();
    const next = () => sub.next();

    const close = () => {
      page.close();
      page.browser().close();
      process.exit(1);
    };

    sub.subscribe({
      next: async () => {
        await initPage();

        const nextFn = index >= urls.length - 1 ? complete : next;

        page.on('request', req => {
          if (req.method() === 'GET') {
            const oldUrl = fetchList.find(v => v === req.url());
            if (!oldUrl && reg.test(req.url())) {
              fetchList.push(req.url());
            }
          }

          // 手动实现代理
          let target: IProxy;
          if (proxys) {
            proxys.forEach(v => {
              if (
                (v.method ? req.method() === v.method : true) &&
                (v.metch ? v.metch.test(req.url()) : true) &&
                (v.ignore ? !v.ignore.test(req.url()) : true)
              ) {
                target = v;
              }
            });
            if (target && target.abort) {
              req.abort();
            } else if (target && target.url && target.replace) {
              req.continue({
                url: req.url().replace(target.url, target.replace),
              });
            } else {
              req.continue();
            }
          } else {
            req.continue();
          }
        });
        // tslint:disable-next-line
        console.log('opening: ', urls[index]);
        await doing(urls[index], page, nextFn, close);
        // page.close();
        index += 1;
      },
      complete: () => {
        page.close();
        page.browser().close();
        res(fetchList);
      },
    });

    sub.next();
  });
};
