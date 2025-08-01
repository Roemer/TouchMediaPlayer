import fs from 'fs';
import path from 'path';
import express from 'express';
import yaml from 'js-yaml';
import shell from 'shelljs';
import WebSocket, { WebSocketServer } from 'ws';
import backlight from 'rpi-backlight';

const port = process.env.PORT || 5000;
const wssport = process.env.WSSPORT || 5001;
const app = express();
const stateFile = '.state.json';
app.set('json spaces', 2)
app.use(express.static('frontend'));
app.use(express.json())
app.use('/media', express.static('media'));

////////////////////////////////////////////////////////////
// API for the client
////////////////////////////////////////////////////////////
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

app.get('/api/alert', function (req, res) {
    shell.exec("media/scripts/alert.sh");
    res.sendStatus(200);
});

app.get('/api/state', function (req, res) {
    if (fs.existsSync(stateFile)) {
        var obj = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        res.json(obj);
    } else {
        res.sendStatus(204);
    }
})

app.post('/api/state', function (req, res) {
    fs.writeFileSync(stateFile, JSON.stringify(req.body));
    res.sendStatus(200);
})

app.post('/api/bt/reconnect', async function (req, res) {
    var resultStr = shell.exec("bluetoothctl devices");
    const regexp = /^Device\s+([A-F0-9:]+)\s+(.*)$/gm;
    const matches = resultStr.matchAll(regexp);

    for (const match of matches) {
        var deviceMac = match[1];
        var deviceName = match[2];
        console.log(`Found device '${deviceName}' (${deviceMac})`);
        if (deviceName == "VAPPEBY Peanut") {
            shell.exec("bluetoothctl disconnect " + deviceMac);
            await sleep(2000);
            shell.exec("bluetoothctl connect " + deviceMac);
            break;
        }
    }

    res.sendStatus(200);
})

////////////////////////////////////////////////////////////
// API for remote control
////////////////////////////////////////////////////////////
app.get('/capi/pause', async function (req, res) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            var wsObject = createWsObject("pause");
            client.send(JSON.stringify(wsObject));
        }
    });
    res.sendStatus(200);
});

app.get('/capi/play', async function (req, res) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            var wsObject = createWsObject("play");
            client.send(JSON.stringify(wsObject));
        }
    });
    res.sendStatus(200);
});

app.get('/capi/notify/:soundName', async function (req, res) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            var wsObject = createWsObject("notify");
            wsObject.soundName = req.params.soundName;
            client.send(JSON.stringify(wsObject));
        }
    });
    res.sendStatus(200);
});

// Initialize the websocket server
const wss = new WebSocketServer({ port: wssport });
wss.on('connection', function connection(client) {
    var wsObject = createWsObject("welcome");
    wsObject.text = 'Welcome to touch media player!';
    client.send(JSON.stringify(wsObject));
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
        let hasNew = false;
        let hasPreviousNew = false;
        albumPaths.forEach(albumDir => {
            const albumName = path.basename(albumDir);
            const albumInfo = readInfo(albumDir);
            const albumFile = searchFile(albumDir, /.*\.mp3/);
            const albumCover = searchFile(albumDir, /.*\.(?:jpg|jpeg|png|jfif)/);
            if (albumInfo?.isNew) {
                hasNew = true;
            }
            if (albumInfo?.isPreviousNew) {
                hasPreviousNew = true;
            }
            albums.push({
                title: albumInfo?.title ?? albumName,
                media: albumFile ?? albumInfo?.media,
                cover: albumCover ?? 'images/generic_cover.png',
                isNew: albumInfo?.isNew ?? false,
                isPreviousNew: albumInfo?.isPreviousNew ?? false,
                groupName: groupName,
                albumName: albumName,
            });
        });
        data.groups.push({
            id: groupName,
            title: groupInfo?.title ?? groupName,
            image: groupImage ?? 'images/generic_cover.png',
            albums: albums,
            hasNew: hasNew,
            hasPreviousNew: hasPreviousNew
        })
    })
    //console.log(JSON.stringify(data, null, 2));
    return data;
}

function createWsObject(method) {
    return {
        "method": method
    }
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
    var valueString = value.toString();
    var result = shell.exec(`vcgencmd set_backlight ${valueString}`, { silent: true });
    if (result.code != 0) {
        // Try setting the file
        var backlightPath = '/sys/class/backlight';
        fs.readdirSync(backlightPath).forEach(file => {
            var brightnessFile = path.join(backlightPath, file, 'brightness');
            return fs.writeFile(brightnessFile, valueString, (err) => {
                if (err !== null) {
                    console.log('failed to set backlight brightness: ' + err)
                }
            });
        });
    }
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
