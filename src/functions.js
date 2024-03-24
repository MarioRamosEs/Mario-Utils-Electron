const { Notification } = require("electron");

function notif(title, body = "") {
    new Notification({
        title,
        body,
    }).show();
}

function delay(delayInms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
    });
}

module.exports = {
    notif,
    delay,
};

