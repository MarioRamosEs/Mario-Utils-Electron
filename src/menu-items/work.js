const { exec } = require("child_process");
const { notif, shutdown, iniciarSQLServer } = require("../functions");
const { BrowserWindow } = require("electron");
const { isWin } = require("../consts");

function getWorkMenu() {
    return {
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
                        exec("node C:\\Users\\mario\\Documents\\GitHub\\NodeUtils\\src\\NoIdle.js");
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
                        exec("net stop MSSQL$SQLEXPRESS", iniciarSQLServer());
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
    };
}

module.exports = { getWorkMenu };