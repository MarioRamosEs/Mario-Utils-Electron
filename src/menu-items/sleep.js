const { exec } = require("child_process");
const { isWin } = require("../consts");
const { notif } = require("../functions");

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleepComputer(ms) {
    if (!isWin) return;
    if (ms > 0) {
        notif("Suspender", `El PC se suspenderá en ${ms / 60} minutos`);
        await sleep(ms);
    }
    exec("psshutdown64.exe -d -t 0");
}

module.exports = {
    label: "Suspender en...",
    visible: isWin,
    submenu: [
        {
            label: "Ahora",
            click() {
                sleepComputer(1);
            },
        },
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
};
