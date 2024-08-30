const { exec } = require("child_process");
const { shutdown } = require("../functions");
const { isWin } = require("../consts");

function getShutdownMenu() {
    return {
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
                label: "Ahora",
                click() {
                    shutdown(1);
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
    };
}

module.exports = { getShutdownMenu };