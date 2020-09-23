const fs = require('fs');
const path = require('path');

const mkdirp = require('mkdirp');

const _path = {
    src: process.argv[2],
    dest: process.argv[3],
};

async function copyDir(src, dest, delDist) {
    const files = await new Promise((resolve, reject) => {
        return fs.readdir(src, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });

    files.forEach(async item => {
        let localSrc = path.join(src, item);
        let state = await new Promise((resolve, reject) => {
            return fs.stat(localSrc, (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });

        if (state.isDirectory()) {
            await copyDir(localSrc, dest, delDist);
            console.log(localSrc);
        } else {
            let newDest = path.join(dest, item.substr(0, 1).toUpperCase());
            let fullDest = path.join(newDest, item);
            await new Promise((resolve, reject) => {
                return fs.mkdir(newDest, (err, data) => {
                    if (err) {
                        console.log(localSrc);
                        if (err.code === 'EEXIST') return resolve();
                        reject(err);
                    }
                    resolve();
                });
            });
            fs.rename(localSrc, fullDest, function (err) {
                if (err) {
                    throw err;
                }
            });
        }
    });
}

copyDir(_path.src, _path.dest, true);