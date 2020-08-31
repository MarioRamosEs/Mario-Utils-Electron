const path = require("path");
const { app, Menu, Tray, Notification } = require("electron");
const exec = require("child_process").exec;

const version = require('./../package').version;
const isWin = process.platform === "win32";
const mcuIp = "192.168.1.173";

let tray = null;

function notif(title, body = "") {
  console.log(title + " - " + body);
  new Notification({
    title: title,
    body: body
  }).show();
}

function shutdown(timeInSeconds) {
  if (isWin) {
    exec("shutdown /s /t " + timeInSeconds);
  } else {
    notif("TODO");
  }
}

app.on("ready", () => {
  tray = new Tray(path.join(__dirname, "./../assets/icon.png"));

  const menu = Menu.buildFromTemplate([
    {
      label: version,
      click() {
        if (isWin) {
          notif("Test desde Windows");
        } else {
          notif("Test desde Mac");
        }
      },
    },
    {
      label: "Apagar en...",
      submenu: [
        {
          label: 'Cancelar apagado',
          click() {
            notif("TODO");
          }
        },
        {
          label: '15 minutos',
          click() {
            shutdown(900)
          }
        },
        {
          label: '30 minutos',
          click() {
            shutdown(1800)
          }
        },
        {
          label: '1 hora',
          click() {
            shutdown(3600)
          }
        },
        {
          label: '2 horas',
          click() {
            shutdown(3600 * 2)
          }
        },
        {
          label: '4 horas',
          click() {
            shutdown(3600 * 4)
          }
        }
      ],
    },
    {
      label: "Lolete",
      click() {
        if (isWin) {
          exec("C:\\Users\\mario\\AppData\\Local\\Discord\\Update.exe --processStart Discord.exe");
          exec("C:\\Users\\mario\\AppData\\Local\\Programs\\Blitz\\Blitz.exe");
          exec("\"E:\\Games\\Riot Games\\Riot Client\\RiotClientServices.exe\" --launch-product=league_of_legends --launch-patchline=live");
        } else {
          exec("open -a Blitz");
          exec("open -a LeagueClient");
        }
      },
    },
    {
      label: "No IDLE",
      click() {
        if (isWin) {
          execNoIdle = exec("node C:\\REPOS\\NodeUtils\\src\\NoIdle.js");
          notif("No IDLE iniciado", "Mueve manualmente el cursor para desactivarlo");
        } else {
          notif("TODO");
        }
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

if (!isWin) app.dock.hide();
app.setAppUserModelId(process.execPath)