import { url } from 'inspector';
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
  brower = await puppeteer.launch({
    userDataDir: '_chromeCache',
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      // 关闭跨域检测
      '--disable-web-security',
      // '--proxy-server=192.168.1.249',
      // '--no-sandbox',
    ],
  });
  page = await brower.newPage();
  await page.setJavaScriptEnabled(true);
};

export const puppeteerPages = async (
  urls: string[],
  doing: (
    url: string,
    page: puppeteer.Page,
    next: any,
    fetchList: string[],
  ) => any,
  reg: RegExp,
): Promise<string[]> => {
  // headless: false 表示打开浏览器，查看过程
  return new Promise(async res => {
    await initPage();
    const fetchList: string[] = [];

    page.on('request', req => {
      if (req.method() === 'GET') {
        const oldUrl = fetchList.find(v => v === req.url());
        if (!oldUrl && reg.test(req.url())) {
          fetchList.push(req.url());
        }
      }
    });

    const sub = new Subject();

    let index = 0;

    const complete = () => sub.complete();
    const next = () => sub.next();

    sub.subscribe({
      next: async () => {
        if (index === urls.length - 1) {
          await page.goto(urls[index]);
          await doing(urls[index], page, complete, fetchList);
          index += 1;
        } else {
          await page.goto(urls[index]);
          await doing(urls[index], page, next, fetchList);
          index += 1;
        }
      },
      complete: () => {
        page.close();
        brower.close();
        console.log(fetchList);
        res(fetchList);
      },
    });
    sub.next();
  });
};
