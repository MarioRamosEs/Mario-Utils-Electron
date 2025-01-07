import packageJson from '../../package.json';

const { version } = require("../../package");
const { isWin } = require("../consts");
const { notif } = require("../functions");

module.exports = {
    label: version,
    click() {
        if (isWin) {
            notif("Test desde Windows");
        } else {
            notif("Test desde Mac");
        }
    },
};
