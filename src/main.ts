#!/usr/bin/env node

import { createHash } from 'crypto';
import * as fs from 'fs-extra';
import { resolve } from 'path';
import * as puppeteer from 'puppeteer';

import { argv, bin, md5, pwd } from './bin';
import { usePuppeteer } from './usePuppeteer';
import { useServer } from './useServer';

// tslint:disable no-console

const sleep = (ms: number) => {
  return new Promise(res => {
    setTimeout(() => {
      res();
    }, ms);
  });
};

const defParams = {
  // 等待 fastify 启动
  waitServierTime: 2000,
  config: 'manifest-builder.js',
  // 列入资源的类型
  files: 'js|css|jpg|png|jpge',
  // md5的长度
  md5Length: 7,
  // 是否输出文件尺寸
  useSize: false,
  // 静态服务的端口
  port: 14512,
  // 检索的文件夹
  dir: null,
  // 输出的文件路径
  out: null,
  // 如果无头浏览器碰撞的条目低于某个值，抛出异常
  fetchListLengthChecker: 0,
  puppeteerArgs: [],
  onlyPuppeteer: false,
  // 输入URL列表，会按序使用无头浏览器，自动爬取首URL中请求的资源，根据请求顺序排序
  puppeteerUrls: [],
  // puppeteer的代理配置
  puppeteerProxys: undefined,
  // 操作page，进行交互
  puppeteerDoing: (
    url: string,
    page: puppeteer.Page,
    next: any,
    close: any,
    fetchList: string[],
  ) => {
    //使用 page 对象操作页面，直到运行 next
  },
  // 获取 package.json 中的版本号
  package: 'package.json',
  // 处理 reduce 的路径
  reduce: manifest => {
    return manifest;
  },
};

const logic = async (params = defParams) => {
  if (!params.dir || !params.out) {
    console.log(' ');
    console.log('[ERROE] Please input like:');
    console.log(
      'precache-manifest-builder --dir dist --out precache_manifast.json --html pbulic/index.html --package package.json',
    );
    console.log(' ');

    return;
  }

  let manifast = [];
  let fetchList: string[] = [];
  let isMetchNumber = 0;
  const isUsePuppeteer =
    params.puppeteerUrls && params.puppeteerUrls.length > 0;
  const reg = new RegExp(`\\.(${params.files})`);

  if (isUsePuppeteer) {
    await useServer(params.port, resolve(params.dir));
    console.log('Runing Static Server...');
    // 等待服务端启动
    await sleep(params.waitServierTime);
    console.log('Runing Puppeteer...');
    fetchList = await usePuppeteer(
      params.puppeteerUrls,
      params.puppeteerDoing,
      reg,
      params.puppeteerProxys,
      params.puppeteerArgs,
    );
  }

  const loadBuild = (path: string) => {
    const dir = fs.readdirSync(path);

    dir.forEach((file: string) => {
      const filePath = resolve(path, file);
      const stat = fs.statSync(filePath);

      if (stat) {
        if (stat.isDirectory()) {
          loadBuild(filePath);
        } else if (stat.isFile() && reg.test(file)) {
          const fileString = fs.readFileSync(filePath).toString();

          const item = {
            v: md5(fileString, params.md5Length),
            // size: fileString.length,
            u: filePath.replace(pwd(params.dir), ''),
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
            } else {
              // 如果 onlyPuppeteer，那就不输出puppeteer没匹配的对象
              if (!params.onlyPuppeteer) {
                manifast.push(item);
              }
            }
          } else {
            manifast.push(item);
          }
        }
      }
    });
  };

  loadBuild(pwd(params.dir));

  if (params.reduce) {
    manifast = params.reduce(manifast);
  }

  const packageJSON =
    params.package &&
    JSON.parse(fs.readFileSync(pwd(params.package)).toString());

  fs.writeFileSync(
    pwd(params.out),
    JSON.stringify({
      ...(packageJSON && { version: packageJSON.version }),
      reversion: md5(JSON.stringify(manifast), params.md5Length),
      manifast,
    }),
    { encoding: 'utf8' },
  );

  if (isUsePuppeteer && isMetchNumber < params.fetchListLengthChecker) {
    console.log(
      `[fetchListLengthChecker]: fetchList < ${params.fetchListLengthChecker}, fetchList.length = ${isMetchNumber}`,
    );
    process.exit(1);
  }
};

bin(defParams, logic).then();
