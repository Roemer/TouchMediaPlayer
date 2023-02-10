import fs from 'fs';
import path from 'path';
import express from 'express';
import yaml from 'js-yaml';
import shell from 'shelljs';
import backlight from 'rpi-backlight';

const port = process.env.PORT || 5000;
const app = express();
app.set('json spaces', 2)
app.use(express.static('frontend'));
app.use('/media', express.static('media'));

app.get('/api/data', async function (req, res) {
    var data = await buildData();
    res.json(data);
});

app.get('/api/brightness', async function (req, res) {
    var percentage = req.query.percentage;
    await setBacklight(percentage);
    res.sendStatus(200);
});

app.get('/api/sleep', function (req, res) {
    displaySleep();
    res.sendStatus(200);
});

app.get('/api/pull', function (req, res) {
    shell.exec("git pull");
    res.sendStatus(200);
});

// Start the server
var server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

async function buildData() {
    var data = {
        groups: [],
        albums: []
    };
    var rootPath = './media/audio';
    var groupDirectories = getSubDirectories(rootPath);
    groupDirectories.forEach(groupDir => {
        const groupName = path.basename(groupDir);
        const groupInfo = readInfo(groupDir);
        const groupImage = searchFile(groupDir, /.*\.(?:jpg|jpeg|png|jfif)/);
        const albumPaths = getSubDirectories(groupDir);
        const albums = [];
        albumPaths.forEach(albumDir => {
            const albumName = path.basename(albumDir);
            const albumInfo = readInfo(albumDir);
            const albumFile = searchFile(albumDir, /.*\.mp3/);
            const albumCover = searchFile(albumDir, /.*\.(?:jpg|jpeg|png|jfif)/);
            albums.push({
                title: albumInfo?.title ?? albumName,
                media: albumFile ?? albumInfo?.media,
                cover: albumCover ?? 'images/generic_cover.png',
                isNew: albumInfo?.isNew ?? false,
                isPreviousNew: albumInfo?.isPreviousNew ?? false,
            });
        });
        data.groups.push({
            id: groupName,
            title: groupInfo?.title ?? groupName,
            image: groupImage ?? 'images/generic_cover.png',
            albums: albums
        })
    })
    //console.log(JSON.stringify(data, null, 2));
    return data;
}

function getSubDirectories(basePath) {
    var subDirs = fs.readdirSync(basePath)
        .filter(elm => fs.statSync(path.join(basePath, elm)).isDirectory())
        .map(elm => path.join(basePath, elm));
    return subDirs;
}

function readInfo(basePath) {
    const infoFilePath = searchFile(basePath, /.*\.(?:yml|yaml)/);
    if (fs.existsSync(infoFilePath)) {
        return yaml.load(fs.readFileSync(infoFilePath, 'utf8'));
    }
    return undefined;
}

function searchFile(basePath, regex) {
    var fileName = fs.readdirSync(basePath).find(function (elm) {
        return elm.match(regex);
    });
    if (fileName) {
        return path.join(basePath, fileName);
    }
    return undefined;
}

async function setBacklight(percentage) {
    var value = Math.round(255 / 100.0 * percentage);
    if (value < 15) {
        // Don't set it too low so it is turned off or too dark.
        value = 15;
    }
    shell.exec(`vcgencmd set_backlight ${value.toString()}`, { silent: true });
    return Promise.resolve();

    // Don't use that for now.
    if (backlight.isSupported()) {
        backlight.setBrightness(value.toString());
    } else {
        return Promise.resolve();
    }
}

async function displaySleep() {
    shell.exec("sleep 1; xset -display :0 s activate", { silent: true });
}
