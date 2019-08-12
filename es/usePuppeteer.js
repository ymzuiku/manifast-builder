"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer = require("puppeteer");
const rxjs_1 = require("rxjs");
exports.pageClick = (select, wait) => __awaiter(this, void 0, void 0, function* () {
    const target = yield exports.page.$(select);
    target.click();
    yield exports.page.waitFor(wait);
    return target;
});
exports.initPage = (initArgs) => __awaiter(this, void 0, void 0, function* () {
    if (!exports.brower) {
        exports.brower = yield puppeteer.launch({
            userDataDir: '_chromeCache',
            headless: true,
            ignoreHTTPSErrors: true,
            args: [
                ...initArgs,
            ],
        });
    }
    if (exports.page) {
        exports.page = null;
    }
    exports.page = yield exports.brower.newPage();
    yield exports.page.setRequestInterception(true);
    yield exports.page.setJavaScriptEnabled(true);
});
exports.usePuppeteer = (urls, doing, reg, proxys, initArgs) => __awaiter(this, void 0, void 0, function* () {
    return new Promise(res => {
        const fetchList = [];
        const sub = new rxjs_1.Subject();
        let index = 0;
        const complete = () => sub.complete();
        const next = () => sub.next();
        const stop = () => {
            exports.page.close();
            exports.page.browser().close();
            process.exit(1);
        };
        sub.subscribe({
            next: () => __awaiter(this, void 0, void 0, function* () {
                yield exports.initPage(initArgs);
                const nextFn = index >= urls.length - 1 ? complete : next;
                exports.page.on('request', req => {
                    if (req.method() === 'GET') {
                        const oldUrl = fetchList.find(v => v === req.url());
                        if (!oldUrl && reg.test(req.url())) {
                            fetchList.push(req.url());
                        }
                    }
                    let target;
                    if (proxys) {
                        proxys.forEach(v => {
                            if ((v.method ? req.method() === v.method : true) &&
                                (v.metch ? v.metch.test(req.url()) : true) &&
                                (v.ignore ? !v.ignore.test(req.url()) : true)) {
                                target = v;
                            }
                        });
                        if (target && target.abort) {
                            req.abort();
                        }
                        else if (target && target.url && target.replace) {
                            req.continue({
                                url: req.url().replace(target.url, target.replace),
                            });
                        }
                        else {
                            req.continue();
                        }
                    }
                    else {
                        req.continue();
                    }
                });
                console.log('opening: ', urls[index]);
                yield doing(urls[index], exports.page, nextFn, stop, fetchList);
                index += 1;
            }),
            complete: () => {
                exports.page.close();
                exports.page.browser().close();
                res(fetchList);
            },
        });
        sub.next();
    });
});
//# sourceMappingURL=usePuppeteer.js.map