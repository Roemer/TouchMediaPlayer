# TouchMediaPlayer

## Introduction
This project is a simplistic and child friendly media player, designed for the Raspberry Pi with the official 7" touch display.
After configuration, it can run fully offline or portable if you do have a battery for your Pi.
![Media Player](.github/images/mediaplayer.png)

## Requirements
You need the following hardware for an optimal experience:
- Raspberry Pi (3B+ / 4B recommended) with an appropriate SD card
- Original Raspberry Pi 7" Touchscreen
- SmartiPi Touch 2 (Display Stand)
- Mini External USB Speaker (like https://www.adafruit.com/product/3369)
- Keyboard and Mouse for easier setup

## Features

### Simple UI for even small children to use
The UI is very simplistic. It can be used without being able to read. The folders and albums can be navigated by simply swiping.

### Remote control
There is an integrated remote control to control the device from somewhere else.
Just call their api url from anywhere and they are executed on the device.
The following commands are available.
| command | api url | description |
| --- | --- | --- |
| pause | /capi/pause | Pauses the current playback. |
| notify | /capi/notify/\<soundName\> | Pauses the playback (if any), plays the notification sound and the given sound snippet and resumes playback. |

### Integrated with Raspberry Pi
If the raspberry pi is used, several additional methods are available. These are:
- Control the display brightness
- Put the display to sleep
- Fetch the latest repository from the git

### Can work completely offline after setup
If all the media files are local, the device then works fully offline and can be taken anywhere.

## Installation and Setup
- Install Raspberry Pi OS onto the SD card
- Make sure to disable overscan
- There seems to be a bug with the display and bullseye so that the display turns grey (see https://github.com/raspberrypi/linux/issues/4686).
  To fix this, do the following: Edit the sd card file `boot/config.txt` before inserting it into the Pi by adding `dtparam=i2c_vc_baudrate=50000`
- There is a bug in chromium that the first tab does not load. To fix this, disable hardware acceleration in chromium.
- Optionally install pavucontrol to easily control the default audio device without right click: `apt install pavucontrol`
- Install Node
  - Enable the node repository:
    ```
    sudo su
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    ```
  - Install NodeJS
    ```
    sudo apt install nodejs
    ```
- Clone this repository
  ```
  git clone https://github.com/Roemer/TouchMediaPlayer.git
  ```
- Switch into the cloned repository
  ```
  cd TouchMediaPlayer
  ```
- Install the dependencies
  ```
  npm i
  ```
- Copy the dependencies for the frontend
  ```
  npm run copy-frontend
  ```
- Prepare the media folder (see next chapter)
- Run the server
  ```
  npm run serve
  ```

# Alternative setup to run as Docker container
`docker run -d -v /path/to/your/media:/usr/src/app/media -p 5000:5000 roemer/touch-media-player`
or
`docker compose up`

## Media Folder
The structure of the media for the player is as follows:
```
media
├─ audio
│  ├─ group 1  -> First main group for albums
│  │  ├─ folder.jpg  -> Image that is served as group cover (100x100 is enough)
│  │  ├─ info.yaml   -> Information file for the group
│  │  ├─ album 1     -> First album in this group
│  │  │  ├─ album.mp3   -> The full album as one track.
│  │  │  ├─ folder.jpg  -> Image for this album
│  │  │  └─ info.yaml   -> Information file for the album
│  │  ├─ album 2     -> Second album in this group
│  │  │  └─ ...         -> Same as in album 1
│  │  └─ ...         -> More albums in this group
│  ├─ group 2  -> Second main group for albums
│  │  └─ ...         -> Same as in group 1
|  └─ ...      -> More main group for albums
├─ effects
│  └─ notification.mp3 -> The sound file used before a notification is played
└─ snippets
   ├─ <sound1.mp3> -> Sound file that can be played with with the notify api
   ├─ <sound2.mp3> -> As above
   └─ ... -> Even more sound files
```

The group `info.yaml` looks like:
```yaml
title: GroupTitle
```

The album `info.yaml` looks like:
```yaml
title: AlbumTitle
media: UrlToAudioFile
```
The `media` field is optional. Either place an mp3 in the album folder or specify an url where the media resides.

## Development
Development can be done locally, via VSCode Remote SSH or even VSCode Remote Container.

If you use remoting on the Raspberry Pi, it might freeze due to heavy load from the language server. To prevent that, disable the Typescript and Javascript langauge server from the extensions by searching for `@builtin TypeScript` and disable it for the Pi.

## Build the Docker Image
`docker build -t roemer/touch-media-player .`
