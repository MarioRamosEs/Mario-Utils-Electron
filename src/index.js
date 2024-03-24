/* eslint-disable no-console */
/* eslint-disable linebreak-style */

const path = require("path");
const {
    app,
    Menu,
    Tray,
    powerSaveBlocker,
    BrowserWindow,
    nativeTheme,
} = require("electron");
const { exec } = require("child_process");
const wol = require("wake_on_lan");
const prompt = require("electron-prompt");
const clipboardy = require("clipboardy");
// const startNoIdle = require('./NoIdle');
const robot = require("robotjs");
const utils = require("./utils");

// Constants
const { isWin } = require("./consts");

// Functions
const { notif } = require("./functions");
const { changeOsTheme } = require("./menu-items/changeOsTheme");
const { changeTaskbarState } = require("./menu-items/changeTaskbarState");

// Menu items
const menuVersion = require("./menu-items/version");
const clipboard = require("./menu-items/clipboard");

let tray = null;
let idBloqueoSuspension = 0;
let isDoubleClickEvent = false;

function iniciarSQLServer() {
    exec("net start MSSQL$SQLEXPRESS");
    notif("SQL Server reiniciado");
}

async function startNoIdle() {
    console.log("Start");
    robot.setMouseDelay(2);
    await utils.delay(3000);

    const startingPoint = {
        x: robot.getMousePos().x,
        y: robot.getMousePos().y,
    };

    // If you move the cursor vertically, the script ends
    while (robot.getMousePos().y === startingPoint.y) {
        for (let x = startingPoint.x - 50; x < startingPoint.x + 50; x++) {
            robot.moveMouse(x, startingPoint.y);
        }
        await utils.delay(500);

        for (let x = startingPoint.x + 50; x > startingPoint.x - 50; x--) {
            robot.moveMouse(x, startingPoint.y);
        }
        await utils.delay(500);
    }
    console.log("End");
}

function shutdown(timeInSeconds, restart = "false") {
    if (isWin) exec(`shutdown ${restart ? "/r" : "/s"} /t ${timeInSeconds}`);
    else notif("TODO");
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function singleClickAsync() {
    // Disabled
    await sleep(200);
    if (isDoubleClickEvent) return;
    //turnOnOff(ips.luces);
}

async function doubleClickAsync() {
    isDoubleClickEvent = true;
    await sleep(215);
    isDoubleClickEvent = false;
    startNoIdle();
    notif("No IDLE iniciado", "Mueve manualmente el cursor para desactivarlo");
}

async function sleepComputer(ms) {
    if (!isWin) return;
    await sleep(ms);
    exec("nircmd.exe standby");
}

async function restartExplorerExe() {
    if (!isWin) return;
    exec("taskkill /f /im explorer.exe");
    await sleep(1000);
    exec("explorer.exe");
}

app.on("ready", () => {
    tray = new Tray(
        path.join(
            __dirname,
            nativeTheme.shouldUseDarkColors
                ? "./../assets/icon_light.png"
                : "./../assets/icon_dark.png"
        )
    );

    const menu = Menu.buildFromTemplate([
        menuVersion,
        clipboard,
        {
            label: "Automatizar",
            visible: true,
            submenu: [
                {
                    label: "Pegar portapeles con enters",
                    async click() {
                        try {
                            let data = clipboardy.readSync();
                            const lines = data.split(/\r?\n/);
                            await utils.delay(3000);
                            lines.forEach((line) => {
                                robot.typeString(line);
                                robot.keyTap("enter");
                            });
                            notif("Portapeles pegado con enters");
                        } catch (error) {
                            notif("Error", error);
                        }
                    },
                },
            ],
        },
        {
            label: "Trabajo",
            visible: true,
            submenu: [
                {
                    label: "Tracker",
                    click() {
                        try {
                            const win = new BrowserWindow({});
                            win.loadURL("https://jobtracker.marioramos.es/");
                        } catch (error) {
                            notif("Error", error);
                        }
                    },
                },
                {
                    label: "Plegar",
                    visible: isWin,
                    click() {
                        try {
                            shutdown(1800);
                            exec(
                                "node C:\\Users\\mario\\Documents\\GitHub\\NodeUtils\\src\\NoIdle.js"
                            );
                            notif("Modo plegar iniciado");
                        } catch (error) {
                            notif("Error", error);
                        }
                    },
                },
                {
                    label: "Reiniciar SQL Server",
                    visible: isWin,
                    click() {
                        try {
                            notif("Reiniciando SQL server...");
                            exec(
                                "net stop MSSQL$SQLEXPRESS",
                                iniciarSQLServer()
                            );
                        } catch (error) {
                            notif("Error", error);
                        }
                    },
                },
                {
                    label: "Cerrar Docker",
                    visible: !isWin,
                    click() {
                        try {
                            exec("osascript -e 'quit app \"Docker\"'");
                            notif("Docker cerrado");
                        } catch (error) {
                            notif("Error", error);
                        }
                    },
                },
            ],
        },
        {
            label: "Modo Oscuro/Claro",
            click() {
                changeOsTheme(tray);
            },
        },
        {
            label: "Ocultar/Mostrar barra de tareas",
            visible: isWin,
            click() {
                changeTaskbarState();
            },
        },
        {
            label: "Randomizer",
            click() {
                try {
                    const win = new BrowserWindow({});
                    win.loadURL("https://marioramos.es/utils/randomizer");
                } catch (error) {
                    notif("Error", error);
                }
            },
        },
        {
            label: "Mantenimiento",
            visible: isWin,
            submenu: [
                {
                    label: "Limpiar TEMP",
                    visible: isWin,
                    click() {
                        try {
                            exec("del /q/f/s %TEMP%\\*");
                        } catch (error) {
                            notif("Error", error);
                        }
                    },
                },
                {
                    label: "Reiniciar explorer.exe",
                    visible: isWin,
                    click() {
                        restartExplorerExe();
                    },
                },
                {
                    label: "Apagar WSL",
                    visible: isWin,
                    click() {
                        exec("wsl --shutdown");
                    },
                },
            ],
        },
        {
            label: `Bloqueo suspensión - ${
                idBloqueoSuspension ? "Activado" : "Desactivado"
            }`,
            visible: isWin,
            submenu: [
                {
                    label: "Ver programas que bloquean",
                    click() {
                        exec("start cmd.exe /K powercfg -requests");
                    },
                },
                {
                    label: "Bloquear",
                    click() {
                        if (!idBloqueoSuspension) {
                            idBloqueoSuspension = powerSaveBlocker.start(
                                "prevent-app-suspension"
                            );
                            notif("Bloqueo activado");
                        } else {
                            notif("Bloqueo ya activo");
                        }
                    },
                },
                {
                    label: "Desbloquear",
                    click() {
                        powerSaveBlocker.stop(idBloqueoSuspension);
                        if (!powerSaveBlocker.isStarted(idBloqueoSuspension)) {
                            idBloqueoSuspension = 0;
                            notif("Bloqueo desactivado");
                        } else {
                            notif("No se pudo desbloquear");
                        }
                    },
                },
            ],
        },
        {
            label: "WoL Manual", // Hided
            visible: false,
            click() {
                prompt({
                    title: "Prompt IP",
                    label: "IP:",
                    value: "192.168.1.135",
                })
                    .then((r) => {
                        wol.wake(macs.torre, { address: r }, (error) => {
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
            label: "WoL Torre",
            visible: false,
            click() {
                wol.wake(macs.torre, { address: ips.torre }, (error) => {
                    if (error) {
                        notif(`Error en WoL: ${error}`);
                    } else {
                        notif("WoL correcto");
                    }
                });
            },
        },
        {
            label: "Aire/Estufa",
            visible: false,
            click() {
                turnOnOff(ips.aire2, true);
            },
        },
        {
            label: "Aire/Estufa temporizado",
            visible: false,
            submenu: [
                {
                    label: "5 minutos",
                    click: () => programmedTurnOnOff(ips.aire2, 60 * 5),
                },
                {
                    label: "15 minutos",
                    click: () => programmedTurnOnOff(ips.aire2, 900),
                },
                {
                    label: "30 minutos",
                    click: () => programmedTurnOnOff(ips.aire2, 1800),
                },
                {
                    label: "1 hora",
                    click: () => programmedTurnOnOff(ips.aire2, 3600),
                },
            ],
        },
        {
            label: "Luces",
            visible: false,
            click() {
                turnOnOff(ips.luces);
            },
        },
        {
            label: "Apagar en...",
            visible: isWin,
            submenu: [
                {
                    label: "Cancelar apagado",
                    click() {
                        exec("shutdown /a");
                    },
                },
                {
                    label: "5 minutos",
                    click() {
                        shutdown(60 * 5);
                    },
                },
                {
                    label: "15 minutos",
                    click() {
                        shutdown(900);
                    },
                },
                {
                    label: "30 minutos",
                    click() {
                        shutdown(1800);
                    },
                },
                {
                    label: "1 hora",
                    click() {
                        shutdown(3600);
                    },
                },
                {
                    label: "2 horas",
                    click() {
                        shutdown(3600 * 2);
                    },
                },
                {
                    label: "4 horas",
                    click() {
                        shutdown(3600 * 4);
                    },
                },
            ],
        },
        {
            label: "Reiniciar en...",
            visible: isWin,
            submenu: [
                {
                    label: "Cancelar reinicio",
                    click() {
                        exec("shutdown /a");
                    },
                },
                {
                    label: "5 minutos",
                    click() {
                        shutdown(60 * 5, true);
                    },
                },
                {
                    label: "15 minutos",
                    click() {
                        shutdown(900, true);
                    },
                },
                {
                    label: "30 minutos",
                    click() {
                        shutdown(1800, true);
                    },
                },
                {
                    label: "1 hora",
                    click() {
                        shutdown(3600, true);
                    },
                },
                {
                    label: "2 horas",
                    click() {
                        shutdown(3600 * 2, true);
                    },
                },
                {
                    label: "4 horas",
                    click() {
                        shutdown(3600 * 4, true);
                    },
                },
            ],
        },
        {
            label: "Suspender en...",
            visible: isWin,
            submenu: [
                {
                    label: "5 minutos",
                    click() {
                        sleepComputer(60 * 5);
                    },
                },
                {
                    label: "15 minutos",
                    click() {
                        sleepComputer(900, true);
                    },
                },
                {
                    label: "30 minutos",
                    click() {
                        sleepComputer(1800, true);
                    },
                },
                {
                    label: "1 hora",
                    click() {
                        sleepComputer(3600, true);
                    },
                },
                {
                    label: "2 horas",
                    click() {
                        sleepComputer(3600 * 2, true);
                    },
                },
                {
                    label: "4 horas",
                    click() {
                        sleepComputer(3600 * 4, true);
                    },
                },
            ],
        },
        {
            label: "Lolete",
            visible: false,
            click() {
                if (isWin) {
                    exec(
                        "C:\\Users\\mario\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe"
                    );
                    exec(
                        '"E:\\Games\\Riot Games\\Riot Client\\RiotClientServices.exe" --launch-product=league_of_legends --launch-patchline=live'
                    );
                } else {
                    exec("open -a LeagueClient");
                }
            },
        },
        {
            label: "No IDLE",
            visible: true,
            click() {
                startNoIdle();
                notif(
                    "No IDLE iniciado",
                    "Mueve manualmente el cursor para desactivarlo"
                );
            },
        },
        {
            label: "Cerrar todas las apps",
            visible: !isWin,
            click() {
                exec(
                    "open /Users/marioramos/Repos/Mario-Utils-Electron/QuitAllApps.app"
                );
            },
        },
        {
            label: "Iniciar Paralels",
            visible: false,
            click() {
                exec(
                    "sudo -b /Applications/Parallels Desktop.app/Contents/MacOS/prl_client_app"
                );
                notif("Paralells iniciando...");
            },
        },
        {
            label: "Reiniciar a Windows",
            visible: !isWin,
            click() {
                exec(
                    'sudo bless -mount "/Volumes/BOOTCAMP" -legacy -setBoot -nextonly;sudo shutdown -r now'
                );
                notif("Reiniciando a Windows...");
            },
        },
        {
            label: "Salir",
            click() {
                app.quit();
            },
        },
    ]);

    tray.setToolTip("Mario's Utils");
    tray.setContextMenu(menu);
    tray.setIgnoreDoubleClickEvents(true);
    tray.on("click", () => {
        singleClickAsync();
    });
    tray.on("double-click", () => {
        doubleClickAsync();
    });
});

if (!isWin) app.dock.hide();
app.setAppUserModelId(process.execPath);
app.on("window-all-closed", (e) => e.preventDefault());

