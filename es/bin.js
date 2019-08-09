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
const crypto_1 = require("crypto");
const fs = require("fs-extra");
const path_1 = require("path");
exports.md5 = (data, slice = 7) => {
    const str = crypto_1.createHash('md5')
        .update(data)
        .digest('hex');
    return str.slice(str.length - slice + 1, str.length - 1);
};
exports.pwd = (...args) => path_1.resolve(process.cwd(), ...args);
exports.argv = process.argv.splice(2);
exports.bin = (defParams, logic) => __awaiter(this, void 0, void 0, function* () {
    let params = Object.assign({}, defParams);
    const startTime = Date.now();
    for (let i = 0; i < exports.argv.length; i++) {
        const key = exports.argv[i].replace('--', '');
        const value = exports.argv[i + 1];
        if (params[key] !== undefined) {
            params[key] = Number.isNaN(Number(value)) ? value : Number(value);
        }
    }
    if (params.config && fs.existsSync(exports.pwd(params.config))) {
        const config = require(exports.pwd(params.config));
        if (config) {
            params = Object.assign({}, params, config(params));
        }
    }
    if (exports.argv[0] === 'init') {
        const mb = fs.readFileSync(path_1.resolve(__dirname, 'manifest-builder.js'), {
            encoding: 'utf8',
        });
        fs.writeFileSync(exports.pwd('manifest-builder.js'), mb, { encoding: 'utf8' });
        return;
    }
    if (exports.argv[0] === '--helper') {
        const readmePath = path_1.resolve(__dirname, './README.md');
        if (fs.existsSync(readmePath)) {
            const help = fs.readFileSync(readmePath, {
                encoding: 'utf8',
            });
            console.log(help);
        }
        return;
    }
    if (exports.argv[0] === '--version') {
        const selfPackagePath = path_1.resolve(__dirname, 'package.json');
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
    yield logic(params);
    console.log(`Done in ${(Date.now() - startTime) / 1000}s`);
    process.exit(0);
});
//# sourceMappingURL=bin.js.map