"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const fs = require("fs-extra");
const path_1 = require("path");
const md5 = (data, slice = 7) => {
    const str = crypto_1.createHash('md5').update(data).digest('hex');
    return str.slice(str.length - slice + 1, str.length - 1);
};
const pwd = (...args) => path_1.resolve(process.cwd(), ...args);
const argv = process.argv.splice(2);
const startTime = Date.now();
const params = {
    files: 'js|css|jpg|png|jpge',
    md5Length: 7,
    dir: null,
    out: null,
    html: null,
    sort: null,
    package: null,
};
if (argv[0] === 'create-react-app') {
    params.dir = 'build';
    params.out = 'build/precache_manifast.json';
    params.html = 'build/index.html';
    params.package = 'package.json';
}
for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace('--', '');
    const value = argv[i + 1];
    if (params[key] !== undefined) {
        params[key] = Number.isNaN(Number(value)) ? value : Number(value);
    }
}
const start = () => {
    const selfPackageJSON = JSON.parse(fs.readFileSync(path_1.resolve(__dirname, '../package.json')));
    const packageJSON = params.package && JSON.parse(fs.readFileSync(pwd(params.package)));
    if (argv[0] === '--helper') {
        console.log(' ');
        console.log('[1] Please input like:');
        console.log('manifest-builder --dir dist --out precache_manifast.json --html build/index.html --package package.json');
        console.log(' ');
        console.log('[2] If project is make by create-react-app');
        console.log('manifest-builder create-react-app');
        console.log('--- is equal:');
        console.log('manifest-builder --dir build --out build/precache_manifast.json --html build/index.html --package package.json');
        console.log(' ');
        console.log('[3] Input style is "manifest-builder --key value", all params:');
        console.log(JSON.stringify(params));
        console.log(' ');
        return;
    }
    if (argv[0] === '--version') {
        console.log(' ');
        console.log(`${selfPackageJSON.name} : v${selfPackageJSON.version}`);
        console.log(' ');
        return;
    }
    if (!params.dir || !params.out) {
        console.log(' ');
        console.log('[ERROE] Please input like:');
        console.log('precache-manifest-builder --dir dist --out precache_manifast.json --html pbulic/index.html --package package.json');
        console.log(' ');
        return;
    }
    const manifast = [];
    const loadBuild = (path) => {
        const dir = fs.readdirSync(path);
        dir.forEach((file) => {
            const filePath = path_1.resolve(path, file);
            const stat = fs.statSync(filePath);
            const reg = new RegExp(`\\.(${params.files})`);
            if (stat) {
                if (stat.isDirectory()) {
                    loadBuild(filePath);
                }
                else if (stat.isFile() && reg.test(file)) {
                    const fileString = fs.readFileSync(filePath);
                    manifast.push({
                        r: md5(fileString, params.md5Length),
                        u: filePath.replace(pwd(params.dir), ''),
                    });
                }
            }
        });
    };
    loadBuild(pwd(params.dir));
    fs.writeFileSync(pwd(params.out), JSON.stringify(Object.assign({}, (packageJSON && { version: packageJSON.version }), { reversion: md5(JSON.stringify(manifast), params.md5Length), manifast })), { encoding: 'utf8' });
    console.log(`Done in ${(Date.now() - startTime) / 1000}s`);
};
start();
//# sourceMappingURL=main.js.map