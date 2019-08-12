import * as puppeteer from 'puppeteer';
export declare let page: puppeteer.Page;
export declare let brower: puppeteer.Browser;
export declare const pageClick: (select: string, wait: number) => Promise<puppeteer.ElementHandle<Element>>;
export declare const initPage: (initArgs: string[]) => Promise<void>;
interface IProxy {
    abort?: boolean;
    ignore: RegExp;
    metch: RegExp;
    method: string;
    replace: string;
    url: string;
}
declare type IDoing = (url: string, page: puppeteer.Page, next: any, close: any, fetchList: string[]) => any;
export declare const usePuppeteer: (urls: string[], doing: IDoing, reg: RegExp, proxys?: IProxy[], initArgs?: string[]) => Promise<string[]>;
export {};
