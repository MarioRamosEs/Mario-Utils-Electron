const path = require("path");
const { app, Menu, Tray, Notification } = require("electron");
const exec = require("child_process").exec;

const isWin = process.platform === "win32";

let tray = null;

function notif(value){
  console.log(value);
  new Notification("Test", {
    body: value,
  });
}

app.on("ready", () => {
  tray = new Tray(path.join(__dirname, "./../assets/icon.png"));

  if (isWin) {
    tray.on("click", tray.popUpContextMenu);
  }

  const menu = Menu.buildFromTemplate([
    {
      label: "Test",
      click() {
        if (isWin) {
          notif("Test desde Windows");
        } else {
          notif("Test desde Mac");
        }
      },
    },
    {
      label: "Lolete",
      click() {
        if (isWin) {
          notif("TODO en Windows");
        } else {
          exec("open -a Blitz");
          exec("open -a LeagueClient");
        }
      },
    },
    {
      label: "No IDLE",
      click() {
        notif("TODO");
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
});

app.dock.hide();
