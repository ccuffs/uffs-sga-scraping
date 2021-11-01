const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const delay = require('delay');

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
        if (files[i].endsWith(extension)) {
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