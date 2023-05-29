const { isWin } = require('../consts');
const { nativeTheme } = require('electron');
const { exec } = require('child_process');
const { delay } = require('../functions');
const path = require('path');

async function changeOsTheme(tray) {
    try {
        if (isWin) {
            const winVersionRelease = parseInt(require('os').release().split('.')[2]);
            
            if (winVersionRelease > 22000) { // Windows 11
                if (nativeTheme.shouldUseDarkColors) {
                    exec(`C:\\Windows\\Resources\\Themes\\aero.theme`);
                } else {
                    exec(`C:\\Windows\\Resources\\Themes\\dark.theme`);
                }
                await delay(1000);
                exec(`taskkill /F /IM systemsettings.exe`);
            } else {
                if (nativeTheme.shouldUseDarkColors) {
                    exec(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'AppsUseLightTheme' -Value 1"`);
                    exec(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'SystemUsesLightTheme' -Value 1"`);
                } else {
                    exec(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'AppsUseLightTheme' -Value 0"`);
                    exec(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'SystemUsesLightTheme' -Value 0"`);
                }
            }
        } else {
            if (nativeTheme.shouldUseDarkColors) {
                exec(`osascript -l JavaScript -e "Application('System Events').appearancePreferences.darkMode = false"`);
            } else {
                exec(`osascript -l JavaScript -e "Application('System Events').appearancePreferences.darkMode = true"`);
            }
        }

        // Update tray icon
        tray.setImage(path.join(__dirname, nativeTheme.shouldUseDarkColors ? '../../assets/icon_light.png' : '../../assets/icon_dark.png'));
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    changeOsTheme
};