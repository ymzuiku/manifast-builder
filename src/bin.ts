import { createHash } from 'crypto';
import * as fs from 'fs-extra';
import { resolve } from 'path';

// tslint:disable no-console

export const md5 = (data: string, slice = 7) => {
  const str = createHash('md5')
    .update(data)
    .digest('hex');

  return str.slice(str.length - slice + 1, str.length - 1);
};

export const pwd = (...args: string[]) => resolve(process.cwd(), ...args);
export const argv = process.argv.splice(2);

export const bin = async <S>(defParams: S, logic: any) => {
  let params = { ...defParams };
  const startTime = Date.now();

  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace('--', '');
    const value = argv[i + 1];
    if (params[key] !== undefined) {
      params[key] = Number.isNaN(Number(value)) ? value : Number(value);
    }
  }

  if ((params as any).config && fs.existsSync(pwd((params as any).config))) {
    // tslint:disable-next-line
    const config = require(pwd((params as any).config));
    if (config) {
      params = {
        ...params,
        ...config(params),
      };
    }
  }

  if (argv[0] === 'init') {
    const mb = fs.readFileSync(resolve(__dirname, 'manifest-builder.js'), {
      encoding: 'utf8',
    });
    fs.writeFileSync(pwd('manifest-builder.js'), mb, { encoding: 'utf8' });

    return;
  }

  if (argv[0] === '--helper') {
    const readmePath = resolve(__dirname, './README.md');
    if (fs.existsSync(readmePath)) {
      const help = fs.readFileSync(readmePath, {
        encoding: 'utf8',
      });
      console.log(help);
    }

    return;
  }
  if (argv[0] === '--version') {
    const selfPackagePath = resolve(__dirname, 'package.json');

    if (fs.existsSync(selfPackagePath)) {
      const selfPackageJSON = require(selfPackagePath);
      if (selfPackageJSON) {
        console.log(' ');
        console.log(`${selfPackageJSON.name} : v${selfPackageJSON.version}`);
        console.log(' ');
      }
    }

    return;
  }

  await logic(params);

  console.log(`Done in ${(Date.now() - startTime) / 1000}s`);

  process.exit(0);
};
