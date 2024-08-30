const { exec } = require("child_process");
const { notif, restartExplorerExe } = require("../functions");
const { isWin } = require("../consts");

function getMaintenanceMenu() {
    return {
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
    };
}

module.exports = { getMaintenanceMenu };