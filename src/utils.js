const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const delay = require('delay');

// https://stackoverflow.com/a/66023248
async function checkFileDownloadedIntoDir(dirPath, maxTries, delay) {
    var delayMs = delay || 10000;

    return new Promise(async (resolve, reject) => {
        let noOfFile;
        try {
            noOfFile = fs.readdirSync(dirPath);
        } catch (err) {
            return resolve('null');
        }
        for (let i in noOfFile) {
            if (!noOfFile[i].includes('.crdownload')) {
                continue;
            }
            console.log('delay', delayMs);
            await delay(delayMs);
            if (maxTries <= 0) {
                // TODO: add fs.unlink(dirPath + '/' + noOfFile[i], (err) => {}); to remove file?
                return resolve('Success');
            } else {
                maxTries--;
                await checkFileDownloadedIntoDir(dirPath, maxTries, delayMs);
            }
        }
        return resolve('Success');
    });
};

// Adapted from: https://stackoverflow.com/a/66023248
async function checkFileDownloadedIntoEmptyDir(dirPath, maxWaitTimeSec, delayMs, waiting, maxTries) {
    var delayMs = delayMs || 100;
    var maxWaitTimeSec = maxWaitTimeSec || 20;
    var isWaiting = waiting === undefined ? false : waiting;
    var maxTries = maxTries === undefined ? Math.round((maxWaitTimeSec * 1000) / delayMs) : maxTries;

    return new Promise(async (resolve, reject) => {
        var files, maxReadsDir = 0;
        do {
            try {
                files = fs.readdirSync(dirPath);
                await delay(delayMs);
            } catch (err) {
                return reject('Problem reading directory: ' + err);
            }
        } while (files.length == 0 && maxReadsDir++ <= maxTries);

        for (let i in files) {
            var isDownloading = files[i].includes('.crdownload');
            await delay(delayMs);
            if (maxTries <= 0 || files.length > 0 || (!isDownloading && isWaiting)) {
                return resolve('Done');
            } else {
                maxTries--;
                await checkFileDownloadedIntoEmptyDir(dirPath, maxWaitTimeSec, delayMs, isDownloading, maxTries);
            }
        }
        return reject('Max tries reached');
    });
};

async function createTempDir() {
    const id = randomWord();
    const directory = path.join(os.tmpdir(), id);
    
    await fs.mkdirs(directory);
    return directory;
}

function randomWord() {
    var word = '';
    var tries = 5;

    while(--tries > 0) {
        word += Math.random().toString(36).substring(7);
    }

    return word;
}

function getFilePathInDir(dirPath, extension) {
    let files = fs.readdirSync(dirPath);

    for (let i in files) {
        if (files[i].includes(extension)) {
            return path.join(dirPath, files[i]);
        }
    }

    return null;
}

function output(result, argv) {
    const text = JSON.stringify(result);

    if(argv && !argv.s && !argv.save) {
        console.log(text);
    }
}

module.exports = {
    checkFileDownloadedIntoEmptyDir,
    createTempDir,
    getFilePathInDir,
    output
}