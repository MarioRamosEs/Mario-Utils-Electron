const { exec } = require("child_process");
const { notif, delay } = require("../functions");
const clipboardy = require("clipboardy");

function getAutomateMenu() {
    return {
        label: "Automatizar",
        visible: true,
        submenu: [
            {
                label: "Pegar portapeles con enters",
                async click() {
                    try {
                        const data = clipboardy.readSync();
                        const lines = data.split(/\r?\n/);
                        await delay(3000);
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
    };
}

module.exports = { getAutomateMenu };