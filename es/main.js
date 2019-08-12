#!/usr/bin/env node
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
const fs = require("fs-extra");
const path_1 = require("path");
const bin_1 = require("./bin");
const usePuppeteer_1 = require("./usePuppeteer");
const useServer_1 = require("./useServer");
const sleep = (ms) => {
    return new Promise(res => {
        setTimeout(() => {
            res();
        }, ms);
    });
};
const defParams = {
    waitServierTime: 2000,
    config: 'manifest-builder.js',
    files: 'js|css|jpg|png|jpge',
    md5Length: 7,
    useSize: false,
    port: 14512,
    dir: null,
    out: null,
    fetchListLengthChecker: 0,
    onlyPuppeteer: false,
    puppeteerUrls: [],
    puppeteerProxys: undefined,
    puppeteerDoing: (url, page, next, close, fetchList) => {
    },
    package: 'package.json',
    reduce: manifest => {
        return manifest;
    },
};
const logic = (params = defParams) => __awaiter(this, void 0, void 0, function* () {
    if (!params.dir || !params.out) {
        console.log(' ');
        console.log('[ERROE] Please input like:');
        console.log('precache-manifest-builder --dir dist --out precache_manifast.json --html pbulic/index.html --package package.json');
        console.log(' ');
        return;
    }
    let manifast = [];
    let fetchList = [];
    let isMetchNumber = 0;
    const isUsePuppeteer = params.puppeteerUrls && params.puppeteerUrls.length > 0;
    const reg = new RegExp(`\\.(${params.files})`);
    if (isUsePuppeteer) {
        yield useServer_1.useServer(params.port, path_1.resolve(params.dir));
        console.log('Runing Static Server...');
        yield sleep(params.waitServierTime);
        console.log('Runing Puppeteer...');
        fetchList = yield usePuppeteer_1.usePuppeteer(params.puppeteerUrls, params.puppeteerDoing, reg, params.puppeteerProxys);
    }
    const loadBuild = (path) => {
        const dir = fs.readdirSync(path);
        dir.forEach((file) => {
            const filePath = path_1.resolve(path, file);
            const stat = fs.statSync(filePath);
            if (stat) {
                if (stat.isDirectory()) {
                    loadBuild(filePath);
                }
                else if (stat.isFile() && reg.test(file)) {
                    const fileString = fs.readFileSync(filePath).toString();
                    const item = {
                        v: bin_1.md5(fileString, params.md5Length),
                        u: filePath.replace(bin_1.pwd(params.dir), ''),
                    };
                    if (fetchList.length > 0) {
                        let isMetch = false;
                        for (let i = fetchList.length - 1; i >= 0; i--) {
                            if (fetchList[i].indexOf(file) > -1) {
                                isMetchNumber += 1;
                                console.log(file);
                                isMetch = true;
                            }
                        }
                        if (isMetch) {
                            manifast = [item, ...manifast];
                        }
                        else {
                            if (!params.onlyPuppeteer) {
                                manifast.push(item);
                            }
                        }
                    }
                    else {
                        manifast.push(item);
                    }
                }
            }
        });
    };
    loadBuild(bin_1.pwd(params.dir));
    if (params.reduce) {
        manifast = params.reduce(manifast);
    }
    const packageJSON = params.package &&
        JSON.parse(fs.readFileSync(bin_1.pwd(params.package)).toString());
    fs.writeFileSync(bin_1.pwd(params.out), JSON.stringify(Object.assign({}, (packageJSON && { version: packageJSON.version }), { reversion: bin_1.md5(JSON.stringify(manifast), params.md5Length), manifast })), { encoding: 'utf8' });
    if (isUsePuppeteer && isMetchNumber < params.fetchListLengthChecker) {
        console.log(`[fetchListLengthChecker]: fetchList < ${params.fetchListLengthChecker}, fetchList.length = ${isMetchNumber}`);
        process.exit(1);
    }
});
bin_1.bin(defParams, logic).then();
//# sourceMappingURL=main.js.map