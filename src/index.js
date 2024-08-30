const path = require("path");
const {
    app, Menu, Tray, powerSaveBlocker, BrowserWindow, nativeTheme,
} = require("electron");
const { exec } = require("child_process");

// Constants
const { isWin } = require("./consts");

// Functions
const { notif } = require("./functions");

// Menu items
const menuVersion = require("./menu-items/version");
const clipboard = require("./menu-items/clipboard");
const sleepMenu = require("./menu-items/sleep");
const { changeOsTheme } = require("./menu-items/changeOsTheme");
const { changeTaskbarState } = require("./menu-items/changeTaskbarState");
const { startNoIdle } = require("./menu-items/noIdle");
const { getAutomateMenu } = require("./menu-items/automate");
const { getWorkMenu } = require("./menu-items/work");
const { getMaintenanceMenu } = require("./menu-items/maintenance");
const { getShutdownMenu } = require("./menu-items/shutdown");

let tray = null;
let idBloqueoSuspension = 0;
let isDoubleClickEvent = false;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function singleClickAsync() {
    await sleep(200);
    if (isDoubleClickEvent) return;
    // turnOnOff(ips.luces);
}

async function doubleClickAsync() {
    isDoubleClickEvent = true;
    await sleep(215);
    isDoubleClickEvent = false;
    startNoIdle();
    notif("No IDLE iniciado", "Mueve manualmente el cursor para desactivarlo");
}

app.on("ready", () => {
    tray = new Tray(path.join(__dirname, nativeTheme.shouldUseDarkColors ? "./../assets/icon_light.png" : "./../assets/icon_dark.png"));

    const menu = Menu.buildFromTemplate([
        menuVersion,
        clipboard,
        getAutomateMenu(),
        getWorkMenu(),
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
                    notif("Error", error.message);
                }
            },
        },
        getMaintenanceMenu(),
        {
            label: `Bloqueo suspensión - ${idBloqueoSuspension ? "Activado" : "Desactivado"}`,
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
                            idBloqueoSuspension = powerSaveBlocker.start("prevent-app-suspension");
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
        getShutdownMenu(),
        sleepMenu,
        {
            label: "Lolete",
            visible: false,
            click() {
                if (isWin) {
                    exec("C:\\Users\\mario\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe");
                    exec('"E:\\Games\\Riot Games\\Riot Client\\RiotClientServices.exe" --launch-product=league_of_legends --launch-patchline=live');
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
                notif("No IDLE iniciado", "Mueve manualmente el cursor para desactivarlo");
            },
        },
        {
            label: "Cerrar todas las apps",
            visible: !isWin,
            click() {
                exec("open /Users/marioramos/Repos/Mario-Utils-Electron/QuitAllApps.app");
            },
        },
        {
            label: "Iniciar Paralels",
            visible: false,
            click() {
                exec("sudo -b /Applications/Parallels Desktop.app/Contents/MacOS/prl_client_app");
                notif("Paralells iniciando...");
            },
        },
        {
            label: "Reiniciar a Windows",
            visible: false,
            click() {
                exec('sudo bless -mount "/Volumes/BOOTCAMP" -legacy -setBoot -nextonly;sudo shutdown -r now');
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
