/* eslint-disable no-console */
/* eslint-disable linebreak-style */

const path = require('path');
const {
    app,
    Menu,
    Tray,
    Notification,
    powerSaveBlocker,
    BrowserWindow,
    nativeTheme
} = require('electron');
const {exec} = require('child_process');
const {Client} = require('tplink-smarthome-api');
const wol = require('wake_on_lan');
const prompt = require('electron-prompt');
const clipboardy = require('clipboardy');
// const startNoIdle = require('./NoIdle');
const robot = require('robotjs');
const utils = require('./utils');
const {version} = require('../package');

const isWin = process.platform === 'win32';
const ips = {
    aire2: '192.168.0.19',
    luces: '192.168.0.18',
    torre: '192.168.0.255',
};
const macs = {
    torre: 'E0:D5:5E:89:3C:22',
    aire2: 'b0:95:75:86:88:45',
    luces: 'b0:95:75:86:8a:53',
};

const client = new Client();
let tray = null;
let idBloqueoSuspension = 0;
let isDoubleClickEvent = false;

function notif(title, body = '') {
    new Notification({
        title,
        body,
    }).show();
}

function iniciarSQLServer() {
    exec('net start MSSQL$SQLEXPRESS');
    notif('SQL Server reiniciado');
}

async function startNoIdle() {
    console.log('Start');
    robot.setMouseDelay(2);
    await utils.delay(3000);

    // let mouse = robot.getMousePos();
    const screenSize = robot.getScreenSize();
    const screenMiddle = {
        x: screenSize.width / 2,
        y: screenSize.height / 2
    };
    robot.moveMouse(screenMiddle.x, screenMiddle.y);

    // If you move the cursor vertically, the script ends
    while (robot.getMousePos().y === screenMiddle.y) {
        for (let x = screenMiddle.x - 50; x < screenMiddle.x + 50; x++) {
            robot.moveMouse(x, screenMiddle.y);
        }
        await utils.delay(1000);
        for (let x = screenMiddle.x + 50; x > screenMiddle.x - 50; x--) {
            robot.moveMouse(x, screenMiddle.y);
        }
        await utils.delay(1000);
    }
    console.log('End');
}

function changeOsTheme() {
    try {
        if (isWin) {
            if (nativeTheme.shouldUseDarkColors) {
                exec(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'AppsUseLightTheme' -Value 1"`);
                exec(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'SystemUsesLightTheme' -Value 1"`);
            } else {
                exec(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'AppsUseLightTheme' -Value 0"`);
                exec(`powershell -Command "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize' -Name 'SystemUsesLightTheme' -Value 0"`);
            }
        } else {
            if (nativeTheme.shouldUseDarkColors) {
                exec(`osascript -l JavaScript -e "Application('System Events').appearancePreferences.darkMode = false"`);
            } else {
                exec(`osascript -l JavaScript -e "Application('System Events').appearancePreferences.darkMode = true"`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

function shutdown(timeInSeconds, restart = 'false') {
    if (isWin) exec(`shutdown ${restart ? '/r' : '/s'} /t ${timeInSeconds}`);
    else notif('TODO');
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getPowerState(deviceIp) {
    const device = await client.getDevice({host: deviceIp});
    const powerState = await device.getPowerState();
    return powerState;
}

async function turnOnOff(deviceIp, doNotif = false) {
    const device = await client.getDevice({host: deviceIp});
    const powerState = await device.getPowerState();
    await device.setPowerState(!powerState);
    if (doNotif) notif(`Device turned ${powerState ? 'off' : 'on'}`);
    return !powerState;
}

async function programmedTurnOnOff(deviceIp, timeInSeconds) {
    const powerState = await turnOnOff(deviceIp, true);
    await sleep(timeInSeconds * 1000);
    if (await getPowerState(deviceIp) === powerState) await turnOnOff(deviceIp, true);
}

async function singleClickAsync() {
    await sleep(200);
    if (isDoubleClickEvent) return;
    turnOnOff(ips.luces);
}

async function doubleClickAsync() {
    isDoubleClickEvent = true;
    await sleep(215);
    isDoubleClickEvent = false;
    startNoIdle();
    notif('No IDLE iniciado', 'Mueve manualmente el cursor para desactivarlo');
}

async function sleepComputer(ms) {
    if (!isWin) return;
    await sleep(ms);
    exec('nircmd.exe standby');
}

app.on('ready', () => {
    tray = new Tray(path.join(__dirname, './../assets/icon.png'));

    const menu = Menu.buildFromTemplate([
        {
            label: version,
            click() {
                if (isWin) {
                    notif('Test desde Windows');
                } else {
                    notif('Test desde Mac');
                }
            },
        },
        {
            label: 'Portapapeles',
            visible: true,
            submenu: [
                {
                    label: 'Comillas dobles por comillas simples',
                    click() {
                        try {
                            let temp = clipboardy.readSync();
                            temp = temp.replace('"', "'").trim();
                            clipboardy.writeSync(temp);
                            notif('Comillas dobles cambiadas a simples');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
                {
                    label: 'Comillas simples por comillas dobles',
                    click() {
                        try {
                            let temp = clipboardy.readSync();
                            while (temp.length > 0 && temp.indexOf('"') !== -1) {
                                temp = temp.replace("'", '"').trim();
                            }
                            clipboardy.writeSync(temp);
                            notif('Comillas simples cambiadas a dobles');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
                {
                    label: 'Quitar saltos de línea',
                    click() {
                        try {
                            let temp = clipboardy.readSync();
                            temp = temp.replace(/(\r\n|\n|\r)/gm, '').trim();
                            temp = temp.replace(/\s\s+/g, ' ');
                            clipboardy.writeSync(temp);
                            notif('Saltos de linea quitados');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
                {
                    label: 'Poner en mayúsculas',
                    click() {
                        try {
                            const temp = clipboardy.readSync();
                            clipboardy.writeSync(temp.toUpperCase());
                            notif('Portapeles en mayúsculas');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
                {
                    label: 'Poner en minúsculas',
                    click() {
                        try {
                            const temp = clipboardy.readSync();
                            clipboardy.writeSync(temp.toLowerCase());
                            notif('Portapeles en mayúsculas');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
                {
                    label: 'Limpiar caracteres especiales',
                    click() {
                        try {
                            let temp = clipboardy.readSync();
                            temp = temp.replace(/[áàäâ]/g, 'a');
                            temp = temp.replace(/[éèëê]/g, 'e');
                            temp = temp.replace(/[íìïî]/g, 'i');
                            temp = temp.replace(/[óòöô]/g, 'o');
                            temp = temp.replace(/[úùüû]/g, 'u');
                            temp = temp.replace(/[ñ]/g, 'n');
                            temp = temp.replace(/[ç]/g, 'c');
                            temp = temp.replace(/[¿?¡!]/g, '');
                            temp = temp.replace(/[.,:;()]/g, '');
                            temp = temp.replace(/["']/g, '');
                            temp = temp.replace(/[\[\]{}]/g, '');
                            temp = temp.replace(/[\\]/g, ' ');
                            temp = temp.replace(/[\/]/g, ' ');
                            temp = temp.replace(/[|]/g, ' ');
                            temp = temp.replace(/[+]/g, '');
                            temp = temp.replace(/[*]/g, '');
                            temp = temp.replace(/[-]/g, '');
                            temp = temp.replace(/[=]/g, '');
                            temp = temp.replace(/[&]/g, '');
                            temp = temp.replace(/[<]/g, '');
                            temp = temp.replace(/[>]/g, '');
                            temp = temp.replace(/[~]/g, '');
                            temp = temp.replace(/[`]/g, '');
                            temp = temp.replace(/[$]/g, '');
                            temp = temp.replace(/[%]/g, '');
                            temp = temp.replace(/[#]/g, '');
                            clipboardy.writeSync(temp);
                            notif('Caracteres especiales limpiados');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
            ],
        },
        {
            label: 'Trabajo',
            visible: true,
            submenu: [
                {
                    label: 'Tracker',
                    click() {
                        try {
                            const win = new BrowserWindow({});
                            win.loadURL('https://jobtracker.marioramos.es/');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
                {
                    label: 'Iniciar',
                    visible: isWin,
                    click() {
                        try {
                            exec('code C:\\Users\\mario\\Documents\\GitHub\\hipo-front');
                            exec('github C:\\Users\\mario\\Documents\\GitHub\\hipo-front');
                            exec('C:\\Users\\mario\\Documents\\GitHub\\hipo-back-2\\NHCore.sln');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
                {
                    label: 'Plegar',
                    visible: isWin,
                    click() {
                        try {
                            shutdown(1800);
                            exec('node C:\\Users\\mario\\Documents\\GitHub\\NodeUtils\\src\\NoIdle.js');
                            notif('Modo plegar iniciado');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
                {
                    label: 'Reiniciar SQL Server',
                    visible: isWin,
                    click() {
                        try {
                            notif('Reiniciando SQL server...');
                            exec('net stop MSSQL$SQLEXPRESS', iniciarSQLServer());
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
                {
                    label: 'Cerrar Docker',
                    visible: !isWin,
                    click() {
                        try {
                            exec('osascript -e \'quit app "Docker"\'');
                            notif('Docker cerrado');
                        } catch (error) {
                            notif('Error', error);
                        }
                    },
                },
            ],
        },
        {
            label: 'Modo Oscuro/Claro',
            click() {
                changeOsTheme();
            },
        },
        {
            label: 'Randomizer',
            click() {
                try {
                    const win = new BrowserWindow({});
                    win.loadURL('https://marioramos.es/utils/randomizer');
                } catch (error) {
                    notif('Error', error);
                }
            },
        },
        {
            label: 'Limpiar TEMP',
            visible: isWin,
            click() {
                try {
                    exec('del /q/f/s %TEMP%\\*');
                } catch (error) {
                    notif('Error', error);
                }
            },
        },
        {
            label: `Bloqueo suspensión - ${idBloqueoSuspension ? 'Activado' : 'Desactivado'}`,
            visible: isWin,
            submenu: [
                {
                    label: 'Ver programas que bloquean',
                    click() {
                        exec('start cmd.exe /K powercfg -requests');
                    },
                },
                {
                    label: 'Bloquear',
                    click() {
                        if (!idBloqueoSuspension) {
                            idBloqueoSuspension = powerSaveBlocker.start('prevent-app-suspension');
                            notif('Bloqueo activado');
                        } else {
                            notif('Bloqueo ya activo');
                        }
                    },
                },
                {
                    label: 'Desbloquear',
                    click() {
                        powerSaveBlocker.stop(idBloqueoSuspension);
                        if (!powerSaveBlocker.isStarted(idBloqueoSuspension)) {
                            idBloqueoSuspension = 0;
                            notif('Bloqueo desactivado');
                        } else {
                            notif('No se pudo desbloquear');
                        }
                    },
                },
            ],
        },
        {
            label: 'WoL Manual', // Hided
            visible: false,
            click() {
                prompt({
                    title: 'Prompt IP',
                    label: 'IP:',
                    value: '192.168.1.135',
                })
                    .then((r) => {
                        wol.wake(macs.torre, {address: r}, (error) => {
                            if (error) {
                                notif(`Error en WoL: ${error}`);
                            } else {
                                notif(`WoL correcto ${r}`);
                            }
                        });
                    })
                    .catch(console.error);
            },
        },
        {
            label: 'WoL Torre',
            click() {
                wol.wake(macs.torre, {address: ips.torre}, (error) => {
                    if (error) {
                        notif(`Error en WoL: ${error}`);
                    } else {
                        notif('WoL correcto');
                    }
                });
            },
        },
        {
            label: 'Aire/Estufa',
            visible: false,
            click() {
                turnOnOff(ips.aire2, true);
            },
        },
        {
            label: 'Aire/Estufa temporizado',
            visible: false,
            submenu: [
                {
                    label: '5 minutos',
                    click: () => programmedTurnOnOff(ips.aire2, 60 * 5),
                },
                {
                    label: '15 minutos',
                    click: () => programmedTurnOnOff(ips.aire2, 900),
                },
                {
                    label: '30 minutos',
                    click: () => programmedTurnOnOff(ips.aire2, 1800),
                },
                {
                    label: '1 hora',
                    click: () => programmedTurnOnOff(ips.aire2, 3600),
                },
            ],
        },
        {
            label: 'Luces',
            visible: false,
            click() {
                turnOnOff(ips.luces);
            },
        },
        {
            label: 'Apagar en...',
            visible: isWin,
            submenu: [
                {
                    label: 'Cancelar apagado',
                    click() {
                        exec('shutdown /a');
                    },
                },
                {
                    label: '5 minutos',
                    click() {
                        shutdown(60 * 5);
                    },
                },
                {
                    label: '15 minutos',
                    click() {
                        shutdown(900);
                    },
                },
                {
                    label: '30 minutos',
                    click() {
                        shutdown(1800);
                    },
                },
                {
                    label: '1 hora',
                    click() {
                        shutdown(3600);
                    },
                },
                {
                    label: '2 horas',
                    click() {
                        shutdown(3600 * 2);
                    },
                },
                {
                    label: '4 horas',
                    click() {
                        shutdown(3600 * 4);
                    },
                },
            ],
        },
        {
            label: 'Reiniciar en...',
            visible: isWin,
            submenu: [
                {
                    label: 'Cancelar reinicio',
                    click() {
                        exec('shutdown /a');
                    },
                },
                {
                    label: '5 minutos',
                    click() {
                        shutdown(60 * 5, true);
                    },
                },
                {
                    label: '15 minutos',
                    click() {
                        shutdown(900, true);
                    },
                },
                {
                    label: '30 minutos',
                    click() {
                        shutdown(1800, true);
                    },
                },
                {
                    label: '1 hora',
                    click() {
                        shutdown(3600, true);
                    },
                },
                {
                    label: '2 horas',
                    click() {
                        shutdown(3600 * 2, true);
                    },
                },
                {
                    label: '4 horas',
                    click() {
                        shutdown(3600 * 4, true);
                    },
                },
            ],
        },
        {
            label: 'Suspender en...',
            visible: isWin,
            submenu: [
                {
                    label: '5 minutos',
                    click() {
                        sleepComputer(60 * 5);
                    },
                },
                {
                    label: '15 minutos',
                    click() {
                        sleepComputer(900, true);
                    },
                },
                {
                    label: '30 minutos',
                    click() {
                        sleepComputer(1800, true);
                    },
                },
                {
                    label: '1 hora',
                    click() {
                        sleepComputer(3600, true);
                    },
                },
                {
                    label: '2 horas',
                    click() {
                        sleepComputer(3600 * 2, true);
                    },
                },
                {
                    label: '4 horas',
                    click() {
                        sleepComputer(3600 * 4, true);
                    },
                },
            ],
        },
        {
            label: 'Lolete',
            visible: false,
            click() {
                if (isWin) {
                    exec('C:\\Users\\mario\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe');
                    exec('"E:\\Games\\Riot Games\\Riot Client\\RiotClientServices.exe" --launch-product=league_of_legends --launch-patchline=live');
                    // exec("C:\\Users\\mario\\AppData\\Local\\Programs\\Blitz\\Blitz.exe");
                } else {
                    // exec("open -a Blitz");
                    exec('open -a LeagueClient');
                }
            },
        },
        {
            label: 'No IDLE',
            visible: true,
            click() {
                startNoIdle();
                notif('No IDLE iniciado', 'Mueve manualmente el cursor para desactivarlo');
            },
        },
        {
            label: 'Cerrar todas las apps',
            visible: !isWin,
            click() {
                exec('open /Users/marioramos/Repos/Mario-Utils-Electron/QuitAllApps.app');
            },
        },
        {
            label: 'Iniciar Paralels',
            visible: !isWin,
            click() {
                exec('sudo -b /Applications/Parallels Desktop.app/Contents/MacOS/prl_client_app');
                notif('Paralells iniciando...');
            },
        },
        {
            label: 'Salir',
            click() {
                app.quit();
            },
        },
    ]);

    tray.setToolTip("Mario's Utils");
    tray.setContextMenu(menu);
    tray.setIgnoreDoubleClickEvents(true);
    tray.on('click', () => {
        singleClickAsync();
    });
    tray.on('double-click', () => {
        doubleClickAsync();
    });
});

if (!isWin) app.dock.hide();
app.setAppUserModelId(process.execPath);
app.on('window-all-closed', (e) => e.preventDefault());
