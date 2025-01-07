const { Client } = require("tplink-smarthome-api");
const { notif } = require("../functions");

const client = new Client();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPowerState(deviceIp) {
    const device = await client.getDevice({ host: deviceIp });
    const powerState = await device.getPowerState();
    return powerState;
}

async function turnOnOff(deviceIp, doNotif = false) {
    const device = await client.getDevice({ host: deviceIp });
    const powerState = await device.getPowerState();
    await device.setPowerState(!powerState);
    if (doNotif) notif(`Device turned ${powerState ? "off" : "on"}`);
    return !powerState;
}

async function programmedTurnOnOff(deviceIp, timeInSeconds) {
    const powerState = await turnOnOff(deviceIp, true);
    await sleep(timeInSeconds * 1000);
    if ((await getPowerState(deviceIp)) === powerState) await turnOnOff(deviceIp, true);
}

module.exports = {
    getPowerState,
    turnOnOff,
    programmedTurnOnOff,
};
