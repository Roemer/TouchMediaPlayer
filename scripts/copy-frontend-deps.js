const fs = require('fs');
const path = require('path');

const modulesRoot = 'node_modules';
const targetCssPath = 'frontend/css';
const targetJsPath = 'frontend/js';
const targetFontsPath = 'frontend/fonts';
const errorCallback = (err) => {
    if (err) {
        console.log("Error Found:", err);
    }
};

// Prepare directories
ensureDirectoryExists(targetCssPath);
ensureDirectoryExists(targetJsPath);
ensureDirectoryExists(targetFontsPath);

// PaperCSS
let filePath = copyFile(path.join(modulesRoot, 'papercss/dist/paper.min.css'));
// Replace the external font with a local one
const data = fs.readFileSync(filePath, 'utf8');
const result = data.replace('@import url("https://fonts.googleapis.com/css?family=Neucha|Patrick+Hand+SC");',
    '@import url("../fonts/patrick-hand-sc/index.css");@import url("../fonts/neucha/index.css");'
);
fs.writeFileSync(filePath, result, 'utf8');
// Copy the fonts
fs.cpSync(path.join(modulesRoot, '@fontsource/patrick-hand-sc'), path.join(targetFontsPath, 'patrick-hand-sc'), { recursive: true }, errorCallback);
fs.cpSync(path.join(modulesRoot, '@fontsource/neucha'), path.join(targetFontsPath, 'neucha'), { recursive: true }, errorCallback);

// Swiper
copyFile(path.join(modulesRoot, 'swiper/swiper-bundle.min.css'));
copyFile(path.join(modulesRoot, 'swiper/swiper-bundle.min.js'));

// Ionicons
fs.cp(path.join(modulesRoot, 'ionicons/dist/ionicons'), path.join(targetJsPath, 'ionicons'), { recursive: true }, errorCallback);

// Vue
copyFile(path.join(modulesRoot, 'vue/dist/vue.global.prod.js'));

function copyFile(srcFilePath) {
    const fileName = path.basename(srcFilePath);
    if (fileName.endsWith('.css')) {
        const destFilePath = path.join(targetCssPath, fileName);
        fs.copyFileSync(srcFilePath, destFilePath);
        return destFilePath;
    } else if (fileName.endsWith('.js')) {
        const destFilePath = path.join(targetJsPath, fileName);
        fs.copyFileSync(srcFilePath, destFilePath);
        return destFilePath;
    } else {
        throw `Unknown file ending: ${fileName}`;
    }
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}